use crate::session::DomainEvent;
use chrono::Local;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::io;
use std::path::Path;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct DailyStats {
    pub focus_completed: u32,
    pub breaks_completed: u32,
    pub breaks_skipped: u32,
}

#[derive(Clone, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct StatsStore {
    pub days: BTreeMap<String, DailyStats>,
}

pub fn today_key() -> String {
    Local::now().format("%Y-%m-%d").to_string()
}

impl StatsStore {
    pub fn apply(&mut self, date: &str, event: &DomainEvent) -> bool {
        match event {
            DomainEvent::FocusCompleted => {
                self.days.entry(date.to_string()).or_default().focus_completed += 1;
                true
            }
            DomainEvent::BreakCompleted => {
                self.days.entry(date.to_string()).or_default().breaks_completed += 1;
                true
            }
            DomainEvent::BreakSkipped => {
                self.days.entry(date.to_string()).or_default().breaks_skipped += 1;
                true
            }
            DomainEvent::PhaseChanged { .. } => false,
        }
    }

    pub fn apply_today(&mut self, event: &DomainEvent) -> bool {
        let key = today_key();
        self.apply(&key, event)
    }

    pub fn get(&self, date: &str) -> DailyStats {
        self.days.get(date).copied().unwrap_or_default()
    }

    pub fn today(&self) -> DailyStats {
        self.get(&today_key())
    }

    pub fn load(path: &Path) -> Self {
        let Ok(raw) = fs::read_to_string(path) else {
            return Self::default();
        };
        serde_json::from_str(&raw).unwrap_or_default()
    }

    pub fn save(&self, path: &Path) -> io::Result<()> {
        if let Some(parent) = path.parent() {
            if !parent.as_os_str().is_empty() {
                fs::create_dir_all(parent)?;
            }
        }
        let tmp_path = path.with_extension("json.tmp");
        let payload = serde_json::to_string_pretty(self)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
        fs::write(&tmp_path, payload)?;
        fs::rename(&tmp_path, path)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::session::Phase;
    use std::env;

    #[test]
    fn counters_increment_per_domain_event() {
        let mut store = StatsStore::default();
        let d = "2026-11-07";

        assert!(store.apply(d, &DomainEvent::FocusCompleted));
        assert!(store.apply(d, &DomainEvent::FocusCompleted));
        assert!(store.apply(d, &DomainEvent::BreakCompleted));
        assert!(store.apply(d, &DomainEvent::BreakSkipped));
        assert!(!store.apply(
            d,
            &DomainEvent::PhaseChanged {
                from: Phase::Idle,
                to: Phase::Focus
            }
        ));

        assert_eq!(
            store.get(d),
            DailyStats {
                focus_completed: 2,
                breaks_completed: 1,
                breaks_skipped: 1,
            }
        );
    }

    #[test]
    fn json_round_trip_and_corrupt_file_fallback() {
        let dir = env::temp_dir().join("pacerx_stats_test");
        let _ = fs::remove_dir_all(&dir);
        let path = dir.join("stats.json");

        // Missing file -> default
        let loaded = StatsStore::load(&path);
        assert_eq!(loaded, StatsStore::default());

        // Save and load round-trip
        let mut store = StatsStore::default();
        store.apply("2026-11-07", &DomainEvent::FocusCompleted);
        store.save(&path).expect("save should succeed");

        let loaded = StatsStore::load(&path);
        assert_eq!(loaded.get("2026-11-07").focus_completed, 1);

        // Corrupt file -> default
        fs::write(&path, "{ not valid json").unwrap();
        let corrupt_loaded = StatsStore::load(&path);
        assert_eq!(corrupt_loaded, StatsStore::default());

        let _ = fs::remove_dir_all(&dir);
    }
}
