use serde::{Deserialize, Serialize};
use std::fmt;
use std::fs;
use std::io;
use std::path::Path;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Settings {
    pub version: u32,
    pub character_id: String,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            version: 1,
            character_id: "mint".into(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SettingsError {
    UnknownCharacter(String),
}

impl fmt::Display for SettingsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SettingsError::UnknownCharacter(id) => write!(f, "unknown character id: {id}"),
        }
    }
}

impl std::error::Error for SettingsError {}

impl Settings {
    pub fn load(path: &Path) -> Self {
        let Ok(raw) = fs::read_to_string(path) else {
            return Self::default();
        };
        match serde_json::from_str::<Settings>(&raw) {
            Ok(s) if s.version >= 1 && !s.character_id.trim().is_empty() => s,
            _ => Self::default(),
        }
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

    pub fn with_character(&self, id: &str, known: &[&str]) -> Result<Self, SettingsError> {
        if !known.contains(&id) {
            return Err(SettingsError::UnknownCharacter(id.to_string()));
        }
        Ok(Self {
            version: self.version,
            character_id: id.to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn default_and_validation() {
        let s = Settings::default();
        assert_eq!(s.version, 1);
        assert_eq!(s.character_id, "mint");

        let known = ["mint", "gece"];
        let updated = s.with_character("gece", &known).expect("gece is known");
        assert_eq!(updated.character_id, "gece");

        let err = s.with_character("unknown", &known);
        assert_eq!(
            err,
            Err(SettingsError::UnknownCharacter("unknown".to_string()))
        );
    }

    #[test]
    fn round_trip_and_fallback() {
        let dir = env::temp_dir().join("pacerx_settings_test");
        let _ = fs::remove_dir_all(&dir);
        let path = dir.join("settings.json");

        assert_eq!(Settings::load(&path), Settings::default());

        let custom = Settings {
            version: 1,
            character_id: "mint".into(),
        };
        custom.save(&path).expect("save should work");
        assert_eq!(Settings::load(&path), custom);

        fs::write(&path, "invalid").unwrap();
        assert_eq!(Settings::load(&path), Settings::default());

        let _ = fs::remove_dir_all(&dir);
    }
}
