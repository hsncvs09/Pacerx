use std::time::{Duration, Instant};

/// Returns the duration elapsed since the last keyboard/mouse input on Windows.
/// Returns `None` on non-Windows platforms or if the OS call fails.
pub fn duration_since_input() -> Option<Duration> {
    #[cfg(windows)]
    {
        use std::mem::size_of;
        use windows::Win32::System::SystemInformation::GetTickCount;
        use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};

        let mut info = LASTINPUTINFO {
            cbSize: size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        // SAFETY: `info.cbSize` is initialized to the exact size of `LASTINPUTINFO`.
        let ok = unsafe { GetLastInputInfo(&mut info) }.as_bool();
        if !ok {
            return None;
        }
        // SAFETY: `GetTickCount` has no preconditions.
        let now_ticks = unsafe { GetTickCount() };
        let elapsed_ms = now_ticks.wrapping_sub(info.dwTime);
        Some(Duration::from_millis(u64::from(elapsed_ms)))
    }

    #[cfg(not(windows))]
    {
        None
    }
}

/// Checks if keyboard/mouse input occurred within `window`
/// and after `suppress_until` (so input before the break started or from clicking a button is ignored).
pub fn is_input_recent(now: Instant, suppress_until: Option<Instant>, window: Duration) -> bool {
    let Some(idle_dur) = duration_since_input() else {
        return false;
    };
    if let Some(until) = suppress_until {
        if now <= until {
            return false;
        }
        let since_until = now.saturating_duration_since(until);
        if idle_dur >= since_until {
            return false;
        }
    }
    idle_dur < window
}
