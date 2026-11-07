use crate::{tray, AppState};
use pomodoro_core::session::DomainEvent;
use tauri::{AppHandle, Emitter, Manager};

pub fn apply(app: &AppHandle, events: &[DomainEvent]) {
    if events.is_empty() {
        return;
    }

    let state = app.state::<AppState>();
    {
        let mut inner = state.inner.lock().unwrap_or_else(|e| e.into_inner());
        let mut stats_dirty = false;
        for ev in events {
            if inner.stats.apply_today(ev) {
                stats_dirty = true;
            }
        }
        if stats_dirty {
            let _ = inner.stats.save(&state.paths.stats_path);
        }
    }

    for ev in events {
        let _ = app.emit("session://event", ev);
    }

    tray::refresh_menu_and_tooltip(app);
}
