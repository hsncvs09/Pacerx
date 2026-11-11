# Pomodoro Companion — Karakter Tasarım ve Entegrasyon Rehberi

Bu belge, **Pomodoro & Movement Companion** masaüstü uygulamasına yeni, özgün vektörel (`SVG` / `Svelte 5`) karakterler tasarlamak ve yapay zeka (Gemini, Claude, ChatGPT vb.) yardımıyla doğrudan projeye eklenebilir kod üretmek için hazırlanmıştır.

---

## 1. Tasarım Felsefesi ve Biçimsel Özgürlük

Uygulamanın amacı, kullanıcıya çalışma ve hareket/mola döngüsünde eşlik eden yaşayan bir masaüstü arkadaşı sunmaktır. Yeni bir karakter tasarlarken **tamamen özgürsünüz**:

- **Anatomik Zorunluluk Yoktur:** Karakterin kolları, bacakları, ayakları veya insansı bir gövdesi **olmak zorunda değildir**.
- **Form Çeşitliliği:** Karakter; organik bir canlı, sevimli bir hayvan, sıvı/balçık (slime), alev, bitki, mekanik/robotik bir cihaz, kristal, kahve kupası veya tamamen soyut ve geometrik bir varlık olabilir.
- **Kalıplardan ve Klişelerden Bağımsızlık:** 
  - Karakter yorulduğunda alnından ter damlası akması veya dijital bir düşük pil göstergesi olması **gerekmez**.
  - Mola modunda bacaklarını sallayarak yürümesi veya spor yapması **gerekmez**.
  - Karakter her modun duygusunu ve durumunu kendi doğasına uygun görsel dille ifade eder (örneğin renk tonu, parlaklık, ritim, titreşim, süzülme, büyüme/küçülme, doku veya form değişimi).

---

## 2. Karakter Modları (`Mood`), Anlattığı Duygular ve Mesajlar

Uygulamada bir karakterin sahip olabileceği **10 farklı durum (mood)** bulunur. Tasarımda önemli olan, fiziksel veya basmakalıp bir hareket çizmek değil; her modun arkasındaki **duygusal durumu ve kullanıcıya verilen mesajı** karakterin kendi görsel diliyle hissettirmektir:

| Öncelik | Mod Kodu (`Mood`) | Tetiklenme Koşulu | İfade Edilen Duygu & Durum | Kullanıcıya Verilen Mesaj | Tasarım Özgürlüğü & İfade Yaklaşımı |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `dragged` | Kullanıcı karakteri fareyle tutup ekranda sürüklerken | Yerçekimsizlik, dengenin anlık bozulması, şaşkınlık veya eğlenceli bir taşınma hissi | *"Beni taşıyorsun / yeni bir yere yerleşiyorum."* | Form esneyebilir, merkezkaç etkisiyle savrulabilir, yöne doğru hafif eğilebilir veya merakla etrafına bakabilir. |
| **2** | `poked` | Karaktere fareyle tek tıklandığında (~1 saniye) | İrkilme, canlılık, anlık farkındalık, tepki verme | *"Buradayım! Seni duyuyorum ve farkındayım."* | Esneme-ezilme (`squash & stretch`), hafif parıldama, zıplama veya anlık bir ritim/renk tepkisi. |
| **3** | `celebrate` | 25 dakikalık odak süresi başarıyla bittiğinde (~3 saniye) | Zafer, coşku, sevinç, başarma hissi, ferahlama | *"Harika iş çıkardın! Odaklanma oturumu bitti, mola zamanı!"* | Coşkulu bir hareket, dışa doğru yayılan ışıma, genişleme veya karaktere özgü kutlama parçacıkları. |
| **4** | `nag` | Kullanıcı `[Molayı Atla]` butonuna bastığında (60 sn ısrar fazı) | Sevimli bir ısrar, ikna etme çabası, endişeli eşlik, sitem | *"Lütfen biraz dinlen, sağlığın için kısa bir mola vermelisin."* | Ritmik bir rica dalgalanması, hafif titreme, mahcup bir form veya masum bir sitem ifadesi. |
| **5** | `sleeping` | Sayaç duraklatıldığında (`paused = true`) | Huzur, durgunluk, enerji tasarrufu, sakin bekleme | *"Dinlenmeye geçtim, sen geri dönene kadar buradayım."* | Yavaş ritimli nefes alma/nabız atışı, sönükleşen parlaklık, durağan ve sakin bir form. |
| **6** | `warning` | Mola süresinde kullanıcı masadan kalkmayıp fare/klavyeye dokunduğunda | Dikkat çekme, ciddiyet, nazik bir uyarı, yakalandın hissi | *"Hey, şu an mola vaktindesin! Ekran başından uzaklaşmalısın."* | Dikkat çeken bir renk tonu, ritim değişimi, belirginleşen bir uyarı formu veya titreşimi. |
| **7** | `walking` | 5 dakikalık mola (`Break`) süresince kullanıcı bilgisayardan uzaktayken | Tazelenme, yenilenme, canlanma, gevşeme, dinamizm | *"Mola devam ediyor; zihnini ve bedenini ferahlat."* | **Yürümek zorunda değildir.** Rahatlama, süzülme, yavaşça genişleyip daralma, dalgalanma veya keyifli bir dinamizm olabilir. |
| **8** | `focus_sad` | Mola reddedilip aralıksız çalışıldığında (`[Yine de çalış]`) | Yıpranmışlık, aşırı yorgunluk, tükenmişlik, dinlenmeye duyulan derin ihtiyaç | *"Molasız çalışmaktan tükendim; ara vermeden devam etmek iyi gelmiyor."* | Çökme hissi, matlaşan renkler, sönükleşen enerji, ağırlaşan hareket temposu. *(Ter veya pil zorunlu değildir).* |
| **9** | `focus` | Aktif 25 dakikalık çalışma/odaklanma süresi | Derin konsantrasyon, dinginlik, kararlılık, sessiz ve kesintisiz eşlik | *"Seninle birlikte çalışıyorum, dikkatini dağıtmadan yanındayım."* | Minimal, sakin ve dikkat dağıtmayan durağan hareketler. Karakter üzerinde veya çevresinde odak ilerleme çizgisi yer alabilir. |
| **-** | *Molaya Doğru Yorgunluk* | `focus` modunun son %20'sinde (`focusProgress >= 0.8`, son 5 dakika) | Zamanın aktığını ve enerjinin azaldığını hissettiren kademeli yorgunluk | *"Odaklanma turu bitmek üzere, yakında molaya ihtiyacımız olacak."* | Karakterin kendi yapısına uygun kademeli bir ağırlaşma, ışık azalması veya form değişimi *(ter/pil şart değildir)*. |
| **10** | `idle` | Uygulama ilk açıldığında veya sıfırlandığında bekleme durumu | Sakinlik, hazır olma, merak, dostça karşılama | *"Yeni bir oturuma başlamaya hazırım; çift tıklarsan başlarız."* | Hafif bir bekleme salınımı, sakin nefes alma döngüsü, canlı ve dengeli bir duruş. |

### Otomatik Yedekleme (Fallback) Zinciri
Yeni bir karakter tasarlarken 10 modun tamamını ilk anda çizmek istemezseniz, sistem tanımlanmamış modları otomatik olarak şu zincirle tamamlar ([`src/characters/types.ts`](./src/characters/types.ts)):
- `focus_sad` yoksa → `focus`
- `warning` yoksa → `nag` → `focus_sad` → `focus` → `idle`
- `walking`, `celebrate`, `poked`, `dragged`, `sleeping` yoksa → `idle`

---

## 3. Teknik SVG Standartları ve Performans İlkeleri

Uygulama şeffaf bir masaüstü penceresinde (`WebView2`) sürekli en üstte çalıştığı için karakterlerin **düşük CPU (%0–1) ve sabit RAM** tüketmesi kritik önem taşır:

1. **Koordinat Alanı (`viewBox`):**
   - Standart vektör tuval boyutu: **`viewBox="0 0 240 240"`** (`viewBoxWidth: 240`, `viewBoxHeight: 240`).
   - Bileşen, dış `<svg>` etiketini üst sarmalayıcıdan (`CharacterStage.svelte`) alır; bu nedenle doğrudan `<g>` kök elemanıyla başlamalıdır.
   - Karakterin tabanı (varsa zemin gölgesi) yaklaşık `y = 210-215` civarında hizalanmalı; kutlama sıçramaları veya baş üstü efektler için üst kısım (`y = 0..30`) pay olarak bırakılmalıdır.

2. **Kesinlikle Kaçınılması Gerekenler (Performans Kuralı):**
   - `<svg>` veya hareketli katmanlarda **CSS `filter: drop-shadow(...)`** veya **SVG `<filter>` (`feGaussianBlur` vb.) KULLANMAYIN**. Şeffaf WebView2 penceresinde hareketli vektörler üzerinde bulanıklık filtresi çalıştırmak GPU doku önbelleğinin kontrolsüzce şişmesine ve yüksek bellek/CPU kullanımına yol açar.
   - Gölge, parlama ve ışık efektlerini daima yarı saydam vektör şekilleriyle (`<ellipse opacity="0.2">`, `<polygon>`, `<linearGradient>`, `<radialGradient>`) çizin.
   - Uzun süren döngülerde (`idle`, `focus`, `focus_sad`, `sleeping`) CPU kullanımını sıfıra yakın tutmak için `steps(2, end)` veya optimize edilmiş CSS anahtar kareleri (keyframe) kullanın.

3. **Katmanlama (Rigging) ve Grup Mimarisi:**
   - Karakterin anatomisi ne olursa olsun, SVG elemanlarınızı mantıklı `<g>` gruplarına ayırın:
     - `base-layer`: Karakterin ana gövdesi, kütlesi veya çekirdeği.
     - `accent-layer`: Karakteri zenginleştiren detaylar, desenler veya parçalar.
     - `expression-layer`: Yüz, mimik, sembol, vizör veya duygu belirten merkez bölge.
     - `fx-layer`: Kutlama, uyarı veya uyku anlarında beliren dış parçacıklar / efektler.
   - Döndürme (`rotate`) ve ölçekleme (`scale`) animasyonlarında her parçanın `transform-origin` değerini kendi dönme/genleşme merkezine göre belirleyin.

4. **Tıklama Maskesi (`hitMask`):**
   - Şeffaf pencerenin karakter dışındaki boş alanlarının arkadaki pencerelere tıklamayı geçirmesi (`click-through`) için `pack.ts` içinde karakterin kapladığı dikdörtgen bölgeler (`Rect[]`: `{ x, y, w, h }`) `240x240` koordinat sistemine göre tanımlanır.

5. **Hareket Hassasiyeti (`reducedMotion`):**
   - Kullanıcı erişilebilirlik ayarlarında hareket azaltmayı seçtiğinde (`reducedMotion === true`), tüm CSS animasyonları devre dışı bırakılmalıdır (`.reduced-motion * { animation: none !important; }`).

---

## 4. Yeni Bir Karakter Projeye Nasıl Eklenir?

Yeni bir karakter eklemek için **3 basit adım** yeterlidir:

1. **`src/characters/<karakter_id>/` klasörünü oluşturun:**
   - `CharacterBuddy.svelte`: Karakterin SVG çizimi ve Svelte 5 mantığı.
   - `pack.ts`: `CharacterPack` tanımı ve `hitMask` dikdörtgenleri.
2. **`src/characters/catalog.json` dosyasına karakteri ekleyin:**
   ```json
   [
     { "id": "mint", "name": "Mint" },
     { "id": "ember", "name": "Ember" },
     { "id": "yeni_karakter", "name": "Yeni Karakter" }
   ]
   ```
3. **Otomatik Entegrasyon:**
   - [`src/characters/registry.ts`](./src/characters/registry.ts) klasördeki `pack.ts` dosyalarını otomatik olarak kaydeder.
   - [`src-tauri/src/catalog.rs`](./src-tauri/src/catalog.rs) ise `catalog.json` dosyasını derleme sırasında okur ve sistem tepsisindeki (tray) `Karakter ▸` menüsüne ekler.

---

## 5. Yapay Zeka (AI) İçin Karakter Tasarım Prompt Şablonu

Yeni ve özgün bir karakter tasarlamak istediğinizde aşağıdaki şablonu kopyalayıp **Gemini, Claude veya ChatGPT** gibi bir yapay zeka modeline iletebilirsiniz. 

Bu şablon yapay zekaya herhangi bir uzuv (kol, bacak), yürüme zorunluluğu, ter damlası veya pil göstergesi gibi hazır klişeler dayatmaz; belirlediğiniz konseptin duygularını ve durumlarını özgürce yansıtmasını sağlar:

````markdown
Sen uzman bir SVG karakter illüstratörü ve Svelte 5 (TypeScript) geliştiricisisin.
Masaüstünde çalışan şeffaf pencereli "Pomodoro & Movement Companion" uygulaması için tamamen ÖZGÜN bir vektörel (smooth rigged SVG) karakter paketi tasarlayacağız.

### [ÖZGÜN TASARIM İLKELERİ - ÇOK ÖNEMLİ]
1. Karakter insanımsı olmak zorunda DEĞİLDİR. Kol, bacak, ayak gibi uzuvlar zorunlu değildir. Karakter; amorf bir form, sevimli bir balçık/damla, mistik bir alev, bir bitki, bir hayvan, geometrik/mekanik bir varlık veya soyut bir nesne olabilir.
2. Basmakalıp klişeler KULLANILMAK ZORUNDA DEĞİLDİR: Alından akan ter damlası, dijital düşük pil göstergesi veya bacak sallayarak yürüme animasyonu gibi hazır kalıplara bağlı kalma. Karakter kendi konseptine uygun özgün bir anlatım dili geliştirmelidir (örneğin renk değişimi, parıldama, ritim, form bozulması, süzülme veya doku titreşimi).
3. Mola modu (`walking`): Karakter fiziksel olarak yürümek zorunda DEĞİLDİR. Bu mod bir dinlenme, ferahlama ve yenilenme fazıdır; konseptine göre süzülebilir, gevşeyebilir veya canlanabilir.

### [KARAKTER KONSEPTİ]
- Karakter Kimliği (`id`): `[karakter_id, örn: damla]`
- Karakter Adı (`name`): `[Görünen ad, örn: Damla]`
- Görsel Konsept & Biçim: [Karakterin şekli, renk paleti, yapısı ve görsel kimliğini buraya tarif edin]
- Duygu ve Durum İfade Biçimi: [Karakterin konseptine özgü olarak sevinç, yorgunluk, odaklanma ve uyarı durumlarını nasıl yansıtacağını tarif edin]

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
3. **SVG Koordinatları:** `<svg>` dış sarmalayıcısı üst bileşende bulunduğu için bileşen doğrudan `<g>` kök elemanıyla başlamalı ve **`240x240`** (`viewBox="0 0 240 240"`) koordinat uzayına göre çizilmelidir.
4. **10 Modun Anlattığı Duyguları ve Mesajları Karakterin Doğasına Göre Canlandır:**
   - `idle`: Sakin, hazır ve dostane bekleme hali (hafif bekleme nefesi veya ritmik salınım).
   - `focus`: Derin konsantrasyon ve kararlı çalışma eşliği. Dikkat dağıtmayan durağan hareketler. Gövde üzerinde veya yanında odak ilerleme çizgisi (`focusProgress = (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs`) entegre edilebilir.
   - **Molaya Yaklaşma Yorgunluğu (`focusProgress >= 0.8`, son 5 dk):** Karakterin yapısına uygun kademeli yorulma veya ağırlaşma hissi.
   - `focus_sad`: Molasız aralıksız çalışma yorgunluğu ve tükenmişlik hissi (karaktere uygun çökme, sönükleşme veya enerjisizlik anlatımı).
   - `walking`: Mola zamanı! Zihni ve bedeni dinlendirme, ferahlama ve yenilenme hali (karakterin yapısına uygun ferah ve dinamik bir hareket).
   - `warning`: Masadan kalkılmadığında verilen nazik ama belirgin uyarı ve dikkat çekme hali.
   - `nag`: Molaya çıkılması için sevimli bir ısrar, ikna etme çabası ve sitem.
   - `celebrate`: 25 dakikalık odaklanma oturumu bittiğinde duyulan coşku, sevinç ve başarma hissi.
   - `poked`: Karaktere tıklandığında anlık tepki verme (`squash & stretch`, parıldama veya irkilme).
   - `dragged`: Fareyle sürüklenirken havada taşınma ve denge bozulması hissi.
   - `sleeping`: Sayaç durduğunda huzurlu bekleme ve enerji tasarrufu durumu.
5. **Performans Kuralları (ÇOK ÖNEMLİ):**
   - Kesinlikle CSS `filter: drop-shadow(...)` veya SVG `<filter>` (`feGaussianBlur`) KULLANMA (şeffaf WebView2 penceresinde GPU doku taşması yapar). Gölgelendirmeleri ve ışıkları şeffaf vektör elemanları (`opacity`, `linearGradient`, `radialGradient`) ile çöz.
   - Uzun süreli animasyonlarda (`idle`, `focus`, `focus_sad`, `sleeping`) CPU kullanımını sıfıra yakın tutmak için optimize CSS anahtar kareleri kullan.
   - `reducedMotion === true` olduğunda tüm CSS animasyonlarını devre dışı bırak (`.reduced-motion * { animation: none !important; }`).
6. **`pack.ts` Dosyası:**
   - `240x240` koordinat sisteminde karakterin kapladığı alanı saran `Rect[]` (`{ x, y, w, h }`) içeren `hitMask` fonksiyonunu tanımla ve `pack: CharacterPack` olarak dışa aktar (`viewBoxWidth: 240, viewBoxHeight: 240, pixelArt: false, moods: ALL_MOODS`).
````
