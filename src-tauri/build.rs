fn main() {
    println!("cargo:rerun-if-changed=../src/characters/catalog.json");
    tauri_build::build()
}
