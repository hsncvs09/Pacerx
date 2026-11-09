use crate::AppState;
use pomodoro_core::hit;
use std::sync::atomic::Ordering;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::time::sleep;

pub fn spawn(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut ignoring = false;
        let mut last_cur: Option<(i32, i32)> = None;
        let mut last_hit_gen: u64 = 0;
        let mut current_interval = Duration::from_millis(250);

        loop {
            sleep(current_interval).await;

            let Some(win) = app.get_webview_window("main") else {
                break;
            };
            if !win.is_visible().unwrap_or(false) {
                current_interval = Duration::from_millis(500);
                continue;
            }

            let Ok(cur) = app.cursor_position() else {
                if ignoring {
                    let _ = win.set_ignore_cursor_events(false);
                    ignoring = false;
                }
                current_interval = Duration::from_millis(250);
                continue;
            };

            let cur_i = (cur.x as i32, cur.y as i32);
            let state = app.state::<AppState>();
            if state.is_dragging.load(Ordering::Relaxed) {
                if ignoring {
                    let _ = win.set_ignore_cursor_events(false);
                    ignoring = false;
                }
                current_interval = Duration::from_millis(100);
                continue;
            }

            let hit_gen = state.hit_gen.load(Ordering::Relaxed);

            // Fast path: if cursor hasn't moved and hit regions haven't changed, skip window queries
            if last_cur == Some(cur_i) && hit_gen == last_hit_gen {
                continue;
            }
            last_cur = Some(cur_i);
            last_hit_gen = hit_gen;

            let (Ok(pos), Ok(scale), Ok(size)) = (
                win.outer_position(),
                win.scale_factor(),
                win.inner_size(),
            ) else {
                if ignoring {
                    let _ = win.set_ignore_cursor_events(false);
                    ignoring = false;
                }
                current_interval = Duration::from_millis(250);
                continue;
            };

            if scale <= 0.0 {
                current_interval = Duration::from_millis(250);
                continue;
            }

            let rel_x = (cur.x - f64::from(pos.x)) / scale;
            let rel_y = (cur.y - f64::from(pos.y)) / scale;
            let logical_w = f64::from(size.width) / scale;
            let logical_h = f64::from(size.height) / scale;

            let inside = {
                let hit = state.hit.lock().unwrap_or_else(|e| e.into_inner());
                hit.contains(rel_x, rel_y)
            };

            if inside == ignoring {
                let _ = win.set_ignore_cursor_events(!inside);
                ignoring = !inside;
            }

            current_interval = hit::poll_interval((rel_x, rel_y), (logical_w, logical_h), 48.0);
        }
    });
}
