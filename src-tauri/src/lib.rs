pub mod catalog;
pub mod effects;
pub mod idle;
pub mod passthrough;
pub mod tray;

use pomodoro_core::hit::{HitRegions, Rect};
use pomodoro_core::session::{Command, Config, Phase, Session, Snapshot};
use pomodoro_core::settings::Settings;
use pomodoro_core::stats::{DailyStats, StatsStore};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, State};
use tauri_plugin_window_state::StateFlags;
use tokio::time::{interval, MissedTickBehavior};

pub struct AppPaths {
    pub stats_path: PathBuf,
    pub settings_path: PathBuf,
}

pub struct InnerState {
    pub session: Session,
    pub stats: StatsStore,
    pub settings: Settings,
    pub suppress_input_until: Option<Instant>,
    pub last_tooltip: String,
    pub last_emitted_snap: Option<Snapshot>,
}

pub struct AppState {
    pub inner: Mutex<InnerState>,
    pub hit: Mutex<HitRegions>,
    pub hit_gen: AtomicU64,
    pub paths: AppPaths,
}

pub fn handle_command_internal(app: &AppHandle, cmd: Command) -> Snapshot {
    let now = Instant::now();
    let (events, snap) = {
        let state = app.state::<AppState>();
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        inner.suppress_input_until = Some(now + Duration::from_millis(400));
        let events = inner.session.handle(cmd, now);
        inner.session.set_input_recent(false, now);
        let snap = inner.session.snapshot(now);
        inner.last_emitted_snap = Some(snap.clone());
        (events, snap)
    };

    effects::apply(app, &events);
    if events.is_empty() {
        tray::refresh_menu_and_tooltip(app);
    }
    let _ = app.emit("session://snapshot", &snap);
    snap
}

#[tauri::command]
fn get_snapshot(state: State<'_, AppState>) -> Snapshot {
    let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
    inner.session.snapshot(Instant::now())
}

#[tauri::command]
fn send_command(app: AppHandle, cmd: Command) -> Snapshot {
    handle_command_internal(&app, cmd)
}

#[tauri::command]
fn get_today_stats(state: State<'_, AppState>) -> DailyStats {
    let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
    inner.stats.today()
}

#[tauri::command]
fn get_settings(state: State<'_, AppState>) -> Settings {
    let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
    inner.settings.clone()
}

pub fn set_character_internal(app: &AppHandle, id: &str) -> Result<Settings, String> {
    let known = catalog::known_ids();
    let updated = {
        let state = app.state::<AppState>();
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        let next = inner
            .settings
            .with_character(id, &known)
            .map_err(|e| e.to_string())?;
        let _ = next.save(&state.paths.settings_path);
        inner.settings = next.clone();
        next
    };

    let _ = app.emit("settings://changed", &updated);
    tray::refresh_menu_and_tooltip(app);
    Ok(updated)
}

#[tauri::command]
fn set_character(app: AppHandle, id: String) -> Result<Settings, String> {
    set_character_internal(&app, &id)
}

#[tauri::command]
fn set_hit_regions(state: State<'_, AppState>, rects: Vec<Rect>) {
    let mut hit = state.hit.lock().unwrap_or_else(|e| e.into_inner());
    if hit.rects() != rects.as_slice() {
        *hit = HitRegions::new(rects);
        state.hit_gen.fetch_add(1, Ordering::Relaxed);
    }
}

fn spawn_ticker(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut ticker = interval(Duration::from_millis(100));
        ticker.set_missed_tick_behavior(MissedTickBehavior::Skip);

        loop {
            ticker.tick().await;
            let now = Instant::now();

            let (events, snap, snap_changed) = {
                let state = app.state::<AppState>();
                let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
                let prev_phase = inner.session.phase();
                let recent = if prev_phase == Phase::Break {
                    let window = if inner.session.is_break_overtime(now) {
                        Duration::from_secs(2)
                    } else {
                        Duration::from_secs(5)
                    };
                    idle::is_input_recent(now, inner.suppress_input_until, window)
                } else {
                    false
                };
                inner.session.set_input_recent(recent, now);

                let events = inner.session.tick(now);
                if prev_phase != Phase::Break && inner.session.phase() == Phase::Break {
                    inner.suppress_input_until = Some(now + Duration::from_millis(500));
                    inner.session.set_input_recent(false, now);
                }
                let snap = inner.session.snapshot(now);
                let changed =
                    !events.is_empty() || inner.last_emitted_snap.as_ref() != Some(&snap);
                if changed {
                    inner.last_emitted_snap = Some(snap.clone());
                }
                (events, snap, changed)
            };

            if !events.is_empty() {
                effects::apply(&app, &events);
            } else if snap_changed {
                tray::refresh_tooltip_if_needed(&app, &snap);
            }

            if snap_changed {
                if let Some(win) = app.get_webview_window("main") {
                    if win.is_visible().unwrap_or(false) {
                        let _ = app.emit("session://snapshot", &snap);
                    }
                }
            }
        }
    });
}

fn position_initial_window(app: &AppHandle, has_saved_window_state: bool) {
    let Some(win) = app.get_webview_window("main") else {
        return;
    };

    if !has_saved_window_state {
        if let (Ok(Some(monitor)), Ok(win_size), Ok(scale)) = (
            win.current_monitor().or_else(|_| win.primary_monitor()),
            win.outer_size(),
            win.scale_factor(),
        ) {
            let work_area = monitor.work_area();
            let margin_phys = (24.0 * scale).round() as i32;
            let x = work_area.position.x + work_area.size.width as i32
                - win_size.width as i32
                - margin_phys;
            let y = work_area.position.y + work_area.size.height as i32
                - win_size.height as i32
                - margin_phys;
            let _ = win.set_position(PhysicalPosition::new(x, y));
        }
    }

    let _ = win.show();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
            }
        }))
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::POSITION)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("."));
            let _ = std::fs::create_dir_all(&data_dir);

            let stats_path = data_dir.join("stats.json");
            let settings_path = data_dir.join("settings.json");
            let has_saved_window_state = data_dir.join(".window-state.json").exists()
                || app
                    .path()
                    .app_config_dir()
                    .is_ok_and(|d| d.join(".window-state.json").exists());

            let stats = StatsStore::load(&stats_path);
            let mut settings = Settings::load(&settings_path);
            let known = catalog::known_ids();
            if !known.contains(&settings.character_id.as_str()) {
                settings = Settings::default();
            }
            if !settings_path.exists() {
                let _ = settings.save(&settings_path);
            }

            let session = Session::new(Config::from_env());

            let state = AppState {
                inner: Mutex::new(InnerState {
                    session,
                    stats,
                    settings,
                    suppress_input_until: None,
                    last_tooltip: String::new(),
                    last_emitted_snap: None,
                }),
                hit: Mutex::new(HitRegions::full(210.0, 310.0)),
                hit_gen: AtomicU64::new(1),
                paths: AppPaths {
                    stats_path,
                    settings_path,
                },
            };

            app.manage(state);

            tray::init(app.handle())?;
            position_initial_window(app.handle(), has_saved_window_state);
            spawn_ticker(app.handle().clone());
            passthrough::spawn(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_snapshot,
            send_command,
            get_today_stats,
            get_settings,
            set_character,
            set_hit_regions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
