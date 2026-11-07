use crate::{catalog, handle_command_internal, set_character_internal, AppState};
use pomodoro_core::session::{Command, Phase, Snapshot};
use pomodoro_core::settings::Settings;
use pomodoro_core::stats::DailyStats;
use std::sync::OnceLock;
use std::time::Instant;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, Wry};

const TRAY_ID: &str = "main-tray";
const CHAR_PREFIX: &str = "char:";

struct TrayHandles {
    toggle_item: MenuItem<Wry>,
    skip_item: MenuItem<Wry>,
    reset_item: MenuItem<Wry>,
    stats_item: MenuItem<Wry>,
    char_items: Vec<(String, CheckMenuItem<Wry>)>,
}

static TRAY_HANDLES: OnceLock<TrayHandles> = OnceLock::new();

pub fn init(app: &AppHandle) -> tauri::Result<()> {
    let (snap, today, settings) = {
        let state = app.state::<AppState>();
        let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        (
            inner.session.snapshot(Instant::now()),
            inner.stats.today(),
            inner.settings.clone(),
        )
    };

    let (menu, handles) = build_menu_once(app, &snap, &today, &settings)?;
    let _ = TRAY_HANDLES.set(handles);
    let tooltip = format_tooltip(&snap);

    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .tooltip(&tooltip)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
            let id_str = event.id().as_ref();
            if let Some(char_id) = id_str.strip_prefix(CHAR_PREFIX) {
                let _ = set_character_internal(app, char_id);
                return;
            }
            match id_str {
                "toggle_start_pause" => {
                    let phase = {
                        let state = app.state::<AppState>();
                        let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
                        inner.session.phase()
                    };
                    let cmd = match phase {
                        Phase::Idle => Command::Start,
                        Phase::Focus | Phase::Break => Command::TogglePause,
                        Phase::Nag => Command::AcceptBreak,
                    };
                    let _ = handle_command_internal(app, cmd);
                }
                "skip_break" => {
                    let _ = handle_command_internal(app, Command::SkipBreak);
                }
                "reset" => {
                    let _ = handle_command_internal(app, Command::Reset);
                }
                "toggle_visible" => {
                    toggle_main_window(app);
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_main_window(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon);
    }

    builder.build(app)?;
    Ok(())
}

fn build_menu_once(
    app: &AppHandle,
    snap: &Snapshot,
    today: &DailyStats,
    settings: &Settings,
) -> tauri::Result<(Menu<Wry>, TrayHandles)> {
    let primary_label = primary_action_label(snap);

    let toggle_item = MenuItem::with_id(
        app,
        "toggle_start_pause",
        primary_label,
        true,
        None::<&str>,
    )?;
    let skip_item = MenuItem::with_id(
        app,
        "skip_break",
        "Molayı atla",
        snap.phase == Phase::Break,
        None::<&str>,
    )?;
    let reset_item = MenuItem::with_id(
        app,
        "reset",
        "Sıfırla",
        snap.phase != Phase::Idle,
        None::<&str>,
    )?;
    let vis_item = MenuItem::with_id(app, "toggle_visible", "Göster/Gizle", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let stats_item = MenuItem::with_id(
        app,
        "stats_info",
        format_stats_label(today),
        false,
        None::<&str>,
    )?;

    let char_submenu = Submenu::new(app, "Karakter", true)?;
    let mut char_items = Vec::new();
    for entry in catalog::entries() {
        let item_id = format!("{CHAR_PREFIX}{}", entry.id);
        let checked = settings.character_id == entry.id;
        let check_item =
            CheckMenuItem::with_id(app, item_id, &entry.name, true, checked, None::<&str>)?;
        char_submenu.append(&check_item)?;
        char_items.push((entry.id.clone(), check_item));
    }

    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "Çıkış", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &toggle_item,
            &skip_item,
            &reset_item,
            &vis_item,
            &sep1,
            &stats_item,
            &char_submenu,
            &sep2,
            &quit_item,
        ],
    )?;

    let handles = TrayHandles {
        toggle_item,
        skip_item,
        reset_item,
        stats_item,
        char_items,
    };

    Ok((menu, handles))
}

fn primary_action_label(snap: &Snapshot) -> &'static str {
    match snap.phase {
        Phase::Idle => "Başlat",
        Phase::Focus | Phase::Break if snap.paused => "Devam",
        Phase::Focus | Phase::Break => "Duraklat",
        Phase::Nag => "Molaya dön",
    }
}

fn format_stats_label(today: &DailyStats) -> String {
    format!(
        "Bugün: 🍅 {} · 🚶 {} · ⏭ {}",
        today.focus_completed, today.breaks_completed, today.breaks_skipped
    )
}

/// Updates existing tray menu items in-place without allocating a new Win32 HMENU.
pub fn refresh_menu_and_tooltip(app: &AppHandle) {
    let (snap, today, settings, tooltip_changed, new_tooltip) = {
        let state = app.state::<AppState>();
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        let snap = inner.session.snapshot(Instant::now());
        let today = inner.stats.today();
        let settings = inner.settings.clone();
        let new_tooltip = format_tooltip(&snap);
        let changed = inner.last_tooltip != new_tooltip;
        if changed {
            inner.last_tooltip = new_tooltip.clone();
        }
        (snap, today, settings, changed, new_tooltip)
    };

    if let Some(handles) = TRAY_HANDLES.get() {
        let _ = handles.toggle_item.set_text(primary_action_label(&snap));
        let _ = handles.skip_item.set_enabled(snap.phase == Phase::Break);
        let _ = handles.reset_item.set_enabled(snap.phase != Phase::Idle);
        let _ = handles.stats_item.set_text(format_stats_label(&today));
        for (id, item) in &handles.char_items {
            let _ = item.set_checked(settings.character_id == *id);
        }
    }

    if tooltip_changed {
        if let Some(tray) = app.tray_by_id(TRAY_ID) {
            let _ = tray.set_tooltip(Some(&new_tooltip));
        }
    }
}

pub fn refresh_tooltip_if_needed(app: &AppHandle, snap: &Snapshot) {
    let new_tooltip = format_tooltip(snap);
    let should_update = {
        let state = app.state::<AppState>();
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        if inner.last_tooltip != new_tooltip {
            inner.last_tooltip = new_tooltip.clone();
            true
        } else {
            false
        }
    };
    if should_update {
        if let Some(tray) = app.tray_by_id(TRAY_ID) {
            let _ = tray.set_tooltip(Some(&new_tooltip));
        }
    }
}

fn format_tooltip(snap: &Snapshot) -> String {
    let mins = snap.remaining_secs.div_ceil(60);
    match snap.phase {
        Phase::Idle => "Pomodoro Companion — Hazır".to_string(),
        Phase::Focus if snap.paused => format!("Pomodoro Companion — Duraklatıldı ({mins} dk)"),
        Phase::Break if snap.paused => {
            format!("Pomodoro Companion — Mola duraklatıldı ({mins} dk)")
        }
        Phase::Focus => format!("Pomodoro Companion — Odak ({mins} dk)"),
        Phase::Break => format!("Pomodoro Companion — Mola ({mins} dk)"),
        Phase::Nag => "Pomodoro Companion — Mola bekleniyor".to_string(),
    }
}

fn toggle_main_window(app: &AppHandle) {
    if let Some(win) = app.get_webview_window("main") {
        if win.is_visible().unwrap_or(false) {
            let _ = win.hide();
        } else {
            let _ = win.show();
            let snap = {
                let state = app.state::<AppState>();
                let inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
                inner.session.snapshot(Instant::now())
            };
            let _ = tauri::Emitter::emit(app, "session://snapshot", &snap);
        }
    }
}
