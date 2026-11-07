use serde::Deserialize;
use std::sync::OnceLock;

static CATALOG_JSON: &str = include_str!("../../src/characters/catalog.json");

#[derive(Clone, Debug, Deserialize)]
pub struct CatalogEntry {
    pub id: String,
    pub name: String,
}

pub fn entries() -> &'static [CatalogEntry] {
    static ENTRIES: OnceLock<Vec<CatalogEntry>> = OnceLock::new();
    ENTRIES.get_or_init(|| {
        serde_json::from_str(CATALOG_JSON).expect("src/characters/catalog.json must be valid JSON")
    })
}

pub fn known_ids() -> Vec<&'static str> {
    entries().iter().map(|e| e.id.as_str()).collect()
}
