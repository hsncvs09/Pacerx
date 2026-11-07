# Pomodoro & Movement Companion (Pacerx) 🎮🍅

Ekranınızın köşesinde yaşayan, şeffaf arka planlı, her zaman üstte duran sevimli retro el konsolu masaüstü arkadaşı! **25 dakika odaklanma** ve **5 dakika hareket/yürüyüş molası** döngüsüyle masa başında hareketsiz kalmanızı önler.

---

## ✨ Özellikler

- **Şeffaf Masaüstü Arkadaşı:** Yalnızca karakterin ve konuşma balonunun üzerine tıklanabilir; etrafındaki boş alanlar tıklamaları arkadaki pencerelere geçirir (*click-through*).
- **10 Canlı Karakter Modu:**
  - Odak süresi ilerledikçe (son 5 dakikada) göz kapakları ağırlaşır, ekranda **düşük pil uyarısı** yanıp söner ve **ter damlası** belirir.
  - Mola zamanı geldiğinde sevinçle zıplar (`celebrate`) ve yürüyüşe başlar (`walking`).
  - Mola sırasında fare veya klavyeyi kullanmaya devam ederseniz sizi fark eder (`warning`: *"Hey, masadan kalk! 🚶"*).
  - Molayı atlarsanız (`[Molayı Atla]`) ısrar moduna (`nag`) geçer; yine de çalışmayı seçerseniz (`[Yine de çalış]`) bir sonraki odak turunu yorgun/üzgün (`focus_sad`) modda geçirir.
- **Ultra Hafif:** Tauri v2 + Rust + Svelte 5 ile geliştirilmiştir (~1.3 MB kurulum paketi, ~%0 CPU kullanımı).

---

## 🚀 İndirme ve Kurulum (Kullanıcılar İçin)

Bilgisayarınıza hiçbir geliştirici aracı kurmadan doğrudan kullanmak için:

1. Bu GitHub sayfasının sağ tarafındaki **[Releases](../../releases)** bölümüne tıklayın.
2. En son sürümün altındaki **`Pomodoro.Companion_0.1.0_x64-setup.exe`** (veya `Pomodoro Companion_0.1.0_x64-setup.exe`) kurulum dosyasını indirin ve çalıştırın.
   > **Not:** Windows SmartScreen *"Windows kişisel bilgisayarınızı korudu"* uyarısı gösterirse **"Ek bilgi" (More info) → "Yine de çalıştır" (Run anyway)** seçeneğine tıklayın.

---

## 🕹️ Nasıl Kullanılır?

- **Başlat / Duraklat:** Karakterin üzerine **çift tıklayın**.
- **Kalan Süreyi Gör:** Karakterin üzerine **tek tıklayın**.
- **Taşı:** Karakteri fareyle basılı tutup ekranın istediğiniz köşesine **sürükleyin** (konumu otomatik kaydedilir).
- **Mola Kararları:** Mola başladığında karakterin üstündeki konuşma balonundan:
  - **`[Molayı Atla]`** → Israr modunu başlatır.
  - **`[Tamam, yürüyorum]`** → 5 dakikalık molaya döner.
  - **`[Yine de çalış]`** → Molayı iptal edip yeni odak turuna (üzgün/yorgun modda) başlar.
- **Sistem Tepsisi (Saatin Yanındaki Simge):** Sağ tıklayarak günlük istatistikleri görebilir, sayacı sıfırlayabilir veya uygulamadan çıkabilirsiniz.

---

## 🎨 Yeni Karakter Tasarlama (Yapay Zeka Rehberi)

Kendi vektör karakterinizi yapay zeka yardımıyla tasarlayıp uygulamaya eklemek için **[CHARACTER_DESIGN_GUIDE.md](./CHARACTER_DESIGN_GUIDE.md)** dosyasına göz atın.

---

## 🛠️ Kaynak Koddan Derleme (Geliştiriciler İçin)

Gereksinimler: [Rust](https://rustup.rs/), [Node.js LTS](https://nodejs.org/), Windows 10/11 (WebView2).

```powershell
# Bağımlılıkları yükle
npm.cmd install

# Geliştirme modunda çalıştır
npm.cmd run tauri dev

# Testleri çalıştır
cargo test -p pomodoro-core
npm.cmd test

# Kurulum paketini (.exe) oluştur
npm.cmd run tauri build
```
Kurulum dosyası `target\release\bundle\nsis\Pomodoro Companion_0.1.0_x64-setup.exe` konumunda oluşturulur.
