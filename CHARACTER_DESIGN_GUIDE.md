# Pomodoro Companion — Yapay Zeka ile Karakter Tasarım Rehberi

Bu belge, **Pomodoro & Movement Companion** masaüstü uygulamasına yeni vektörel (`SVG` / `Svelte 5`) karakterler tasarlamak ve yapay zeka (Gemini, Claude, ChatGPT vb.) yardımıyla doğrudan projeye eklenebilir kod üretmek için hazırlanmıştır.

---

## 1. Karakter Modları (`Mood`) ve Görsel Davranış Tablosu

Uygulamada bir karakterin sahip olabileceği **10 farklı durum (mood)** vardır. Durum öncelik sırası (yüksekten düşüğe) ve her modda karakterin sergilemesi gereken görsel tepkiler aşağıdadır:

| Öncelik | Mod Kodu (`Mood`) | Ne Zaman Tetiklenir? | Yüz İfadesi | Gövde / Uzuv Duruşu ve Animasyonu | Ek Görsel Efektler & Konuşma Balonu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `dragged` | Kullanıcı karakteri fareyle tutup ekranda sürüklerken | Şaşkın / telaşlı gözler, küçük `"o"` şeklinde açık ağız (`😮`) | Gövde hafif eğik; kollar yukarı/yana açılmış, bacaklar boşlukta sallanır (`dangle`) | Konuşma balonu yok |
| **2** | `poked` | Karaktere tek tıklandığında (`1 saniye` boyunca) | Gözler kısık (`> <` veya neşeli kırpma), gülümseyen ağız | Hafif ezilip esneme (`squash & stretch` zıplama tepkisi) | Balon: `"Hazır · 25:00"` veya `"Kalan: 14:20"` |
| **3** | `celebrate` | 25 dk odak süresi bittiğinde (`3 saniye` boyunca) | Yıldızlı / parlayan mutlu gözler (`^ ^`), geniş açık sevinçli ağız (`😄`) | Kollar havada (`V` şeklinde), yukarı zıplama (`jump`) animasyonu | Karakter etrafında renkli konfeti parçacıkları; Balon: `"Mola zamanı! 5 dk yürü 🚶"` + `[Molayı Atla]` |
| **4** | `nag` | Kullanıcı `[Molayı Atla]` butonuna bastığında başlayan ısrar fazı (`60 sn`) | Mahcup / yalvaran büyük gözler (`🥺`), titreyen üzgün ağız, yanaklarda kızarıklık | Kollar önde birleşmiş veya yana düşük, gövde hafif sağa-sola sallanır | Düşük pil ikonu + ter damlası; Balon: `"Lütfen 5 dk yürü 🥺"` + `[Tamam, yürüyorum]` / `[Yine de çalış]` |
| **5** | `sleeping` | Sayaç duraklatıldığında (`paused = true`) | Kapalı huzurlu gözler (`- -`), sakin uyku ağzı | Gövde çok yavaş nefes alır (`breathe-slow`), kollar yanda dinlenir | Başın üstünde süzülen `"Zzz"` harfleri |
| **6** | `warning` | Mola (`Break`) sırasında kullanıcı fare veya klavyeye dokunduğunda | Çatık kaşlar, kızgın / uyarıcı gözler (`😠`), ciddi ağız | Bir kol yana/ileri uzanarak "dur / kalk" işareti yapar, hafif uyarı sallanması | Baş üstünde ünlem (`!`) veya uyarı ikonu; Balon: `"Hey, masadan kalk! 🚶"` + `[Molayı Atla]` |
| **7** | `walking` | 5 dakikalık mola (`Break`) boyunca (kullanıcı bilgisayara dokunmazken) | Neşeli / enerjik gözler, ıslık çalan veya gülümseyen ağız | Kollar ve bacaklar karşılıklı yürüyüş (`walk`) temposunda sallanır, gövde hafif yaylanır | Ayak altında hareket çizgileri; Balon: `"Mola zamanı! 5 dk yürü 🚶"` + `[Molayı Atla]` |
| **8** | `focus_sad` | Mola atlandığında (`[Yine de çalış]`) veya molada `warning` tetiklenip masa başından kalkılmadığında başlayan yeni odak turu | Yorgun / yarı kapalı göz kapakları, göz kenarında yaş, üzgün ağız (`😢`) | Omuzlar ve kollar düşük, ağır/yorgun nefes alma | **Düşük pil uyarısı (kırmızı yanıp sönen)** + **ter damlası** + odak ilerleme çubuğu |
| **9** | `focus` | Normal 25 dakikalık çalışma / odaklanma süresi | Odaklanmış sakin gözler (3.5–6 sn'de bir doğal göz kırpma), hafif tebessüm | Gövde sabit/sakin nefes alır, kollar dinlenme pozisyonunda sabit durur | Odak ilerleme çubuğu. **Son %20'de (`focusProgress >= 0.8`, yani son 5 dk):** Göz kapakları kademeli ağırlaşır, **düşük pil ikonu** ve **ter damlası** belirir |
| **10** | `idle` | Uygulama ilk açıldığında veya sıfırlandığında (`Idle` fazı) | Canlı, meraklı gözler (doğal göz kırpma), sıcak gülümseme | Yumuşak nefes alma (`breathe`), hafif arkadaşça duruş | Balon: `"Başlayalım mı? (çift tıkla)"` |

### Otomatik Yedekleme (Fallback) Zinciri
Yeni bir karakter tasarlarken 10 modun tamamını ilk anda çizmek istemezseniz, sistem eksik modları otomatik olarak şu zincirle tamamlar ([`src/characters/types.ts`](./src/characters/types.ts)):
- `focus_sad` yoksa → `focus`
- `warning` yoksa → `nag` → `focus_sad` → `focus` → `idle`
- `walking`, `celebrate`, `poked`, `dragged`, `sleeping` yoksa → `idle`

---

## 2. Teknik SVG ve Performans Kuralları

Uygulama şeffaf bir masaüstü penceresinde (`WebView2`) her zaman üstte çalıştığı için yeni karakterlerin **düşük CPU (%0–1) ve sabit RAM** tüketmesi kritik önem taşır:

1. **Koordinat Alanı (`viewBox`):**
   - Standart vektör tuval boyutu: **`viewBox="0 0 240 240"`** (`viewBoxWidth: 240`, `viewBoxHeight: 240`).
   - Karakterin zemin gölgesi (`<ellipse class="ground-shadow">`) yaklaşık `cx="120" cy="212"` civarında olmalı; başın üstünde zıplama (`celebrate`) ve `"Zzz"` efektleri için `y = 0..28` arası boş bırakılmalıdır.
2. **Kesinlikle Kaçınılması Gerekenler (Performans Kuralı):**
   - `<svg>` veya hareketli `<g>` katmanlarında **CSS `filter: drop-shadow(...)`** veya **SVG `<filter>` (`feGaussianBlur`) KULLANMAYIN**. Şeffaf WebView2 penceresinde hareketli vektörler üzerinde bulanıklık filtresi kullanmak GPU doku önbelleğinin (Skia) yüzlerce MB şişmesine ve yüksek CPU kullanımına yol açar.
   - Gölge ve parlama efektlerini yarı saydam vektör şekilleriyle (`<ellipse opacity="0.22">`, `<circle opacity="0.18">`, `<linearGradient>`) çizin.
   - Uzun süren modlarda (`focus`, `idle`, `focus_sad`, `sleeping`) 60 FPS sürekli animasyon yerine düşük kare hızlı **`steps(2, end)`** veya **`steps(4, end)`** CSS anahtar kareleri kullanın.
3. **Katman İskeleti (Rigging Grupları):**
   - `ground-shadow`: Zemin gölgesi
   - `leg-left`, `leg-right`: Sol ve sağ bacak/ayakkabı (`transform-origin` kalça ekleminde)
   - `body-group`: Ana gövde, ekran/yüz çerçevesi, yorgunluk göstergeleri (ter damlası, düşük pil)
   - `face-group`: Gözler, göz kapakları, kaşlar, ağız, yanaklar
   - `arm-left`, `arm-right`: Sol ve sağ kol (`transform-origin` omuz ekleminde)
   - `fx-group`: Konfeti (`celebrate`), `"Zzz"` (`sleeping`), uyarı ünlemi (`warning`)
4. **Tıklama Maskesi (`hitMask`):**
   - Şeffaf pencerenin karakter dışındaki boş alanlarının arkadaki pencerelere tıklamayı geçirmesi (`click-through`) için `pack.ts` içinde karakterin kapladığı dikdörtgen bölgeler (`Rect[]`: `{ x, y, w, h }`) `240x240` koordinat sistemine göre tanımlanır.

---

## 3. Yeni Bir Karakter Проjeye Nasıl Eklenir?

Yeni bir karakter (örneğin `kedi` veya `kahve`) eklemek için yalnızca **3 adım** yeterlidir:

1. **`src/characters/<karakter_id>/` klasörünü oluşturun:**
   - `src/characters/<karakter_id>/CharacterBuddy.svelte`: Karakterin SVG çizimi ve animasyonları.
   - `src/characters/<karakter_id>/pack.ts`: `CharacterPack` tanımı ve `hitMask` dikdörtgenleri.
2. **`src/characters/catalog.json` dosyasına karakteri ekleyin:**
   ```json
   [
     { "id": "mint", "name": "Mint" },
     { "id": "kahve", "name": "Kahve Kupası" }
   ]
   ```
   *(Not: [`src/characters/registry.ts`](./src/characters/registry.ts) tüm `./*/pack.ts` dosyalarını otomatik olarak tarar; [`src-tauri/src/catalog.rs`](./src-tauri/src/catalog.rs) ise `catalog.json` dosyasını derleme sırasında otomatik okur ve sistem tepsisindeki `Karakter ▸` menüsüne ekler!)*

---

## 4. Yapay Zeka (AI) İçin Hazır Karakter Tasarım Prompt Şablonu

Yeni bir karakter tasarlamak istediğinizde aşağıdaki şablonu kopyalayıp **Gemini / Claude / ChatGPT**'ye yapıştırabilirsiniz. Sadece en üstteki **`[KARAKTER KONSEPTİ]`** bölümünü kendi istediğiniz karakterle değiştirmeniz yeterlidir:

````markdown
Sen uzman bir SVG karakter illüstratörü ve Svelte 5 (TypeScript) geliştiricisisin.
Masaüstünde çalışan şeffaf pencereli "Pomodoro & Movement Companion" uygulamam için yeni bir akıcı vektörel (smooth rigged SVG) karakter paketi tasarlayacağız.

### [KARAKTER KONSEPTİ]
- Karakter Kimliği (`id`): `kedi_bot`
- Karakter Adı (`name`): `Mırnav Bot`
- Görsel Tasarım: Kulaklı, yuvarlak hatlı, sevimli pastel krem/turuncu renklerde mini masaüstü kedi-robot arkadaşı. Gövdesinde küçük bir dijital ekran/yüz var, minik patileri (kolları) ve spor ayakkabılı ayakları var.
- Özel Detaylar: Odaklanırken kulakları dik, yorulduğunda (`focus_sad` ve odak süresinin son %20'sinde) kulakları yana düşüyor, ekranın köşesinde kırmızı düşük pil ikonu yanıp sönüyor ve yanından mavi ter damlası akıyor. Mola yürüyüşünde (`walking`) ağırlık/dambıl OLMADAN kollarını ve bacaklarını sallayarak tempolu yürüyor.

### [TEKNİK GEREKSİNİMLER]
Lütfen bana doğrudan projeme ekleyebileceğim şu 2 dosyayı eksiksiz üret:
1. `src/characters/<id>/CharacterBuddy.svelte`
2. `src/characters/<id>/pack.ts`

Kod şu kurallara %100 uymalıdır:
1. **Svelte 5 Runes API** kullan (`$props()`, `$state()`, `$derived()`, `$effect()`).
2. Bileşen şu `Props` arayüzünü kabul etmelidir:
   ```ts
   import type { Mood, Snapshot } from "../../lib/types";
   interface Props {
     mood: Mood;
     snapshot: Snapshot;
     reducedMotion: boolean;
   }
   ```
3. **SVG Koordinatları:** `<svg>` dış sarmalayıcısı üst bileşende (`CharacterStage.svelte`) bulunduğu için bileşen doğrudan `<g>` kök elemanıyla başlamalı ve **`240x240`** (`viewBox="0 0 240 240"`) koordinat uzayına göre çizilmelidir.
4. **10 Modun Tamamını Destekle (`ALL_MOODS`):**
   - `idle`: Sakin nefes alma, sıcak gülümseme, 3.5–6 saniyede bir doğal göz kırpma.
   - `focus`: Odaklanmış yüz, ekran altında odak ilerleme çubuğu (`(snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs`). Kollar sabit dinlenme pozisyonunda.
   - **Molaya Yaklaşma Yorgunluğu (`focusProgress >= 0.8`):** Odak süresinin son %20'sinde (`focusProgress >= 0.8`), `focus_sad` ve `nag` modlarında göz kapakları kademeli düşmeli, ekranda kırmızı düşük pil ikonu ve gövde yanında ter damlası görünmeli.
   - `focus_sad`: Üzgün/yorgun gözler, göz yaşı, düşük omuzlar, düşük pil + ter damlası.
   - `walking`: Dambıl/ağırlık OLMADAN kolları ve bacakları sallayarak neşeli yürüyüş animasyonu.
   - `warning`: Çatık kaşlar, uyarıcı duruş, baş üstünde `!` işareti.
   - `nag`: Mahcup/yalvaran büyük gözler (`🥺`), yanak kızarıklığı, hafif sağa-sola sallanma.
   - `celebrate`: Kollar havada sevinç zıplaması, yıldızlı/mutlu gözler, etrafta renkli konfeti şekilleri.
   - `poked`: Tek tıklama tepkisi (`squash & stretch`), neşeli göz kırpma.
   - `dragged`: Fareyle sürüklenirken şaşkın yüz (`😮`), sallanan kollar ve bacaklar.
   - `sleeping`: Kapalı gözler, yavaş nefes alma, yükselen `"Zzz"` harfleri.
5. **Performans Kuralları (ÇOK ÖNEMLİ):**
   - Kesinlikle CSS `filter: drop-shadow(...)` veya SVG `<filter>` (`feGaussianBlur`) KULLANMA (şeffaf WebView2'de bellek sızıntısı yapar). Gölgeleri `<ellipse opacity="0.22">` ve `<linearGradient>` ile çiz.
   - Uzun süreli animasyonlarda (`idle`, `focus`, `focus_sad`, `sleeping`) CPU kullanımını sıfıra yakın tutmak için `steps(2, end)` veya `steps(6, end)` kullan.
   - `reducedMotion === true` olduğunda tüm CSS animasyonlarını devre dışı bırak (`.reduced-motion * { animation: none !important; }`).
6. **`pack.ts` Dosyası:**
   - `240x240` koordinat sisteminde karakterin gövde, baş, kol ve bacaklarını kapsayan 4-6 adet `Rect` (`{ x, y, w, h }`) içeren `hitMask` fonksiyonunu tanımla ve `pack: CharacterPack` olarak dışa aktar (`viewBoxWidth: 240, viewBoxHeight: 240, pixelArt: false, moods: ALL_MOODS`).
````
