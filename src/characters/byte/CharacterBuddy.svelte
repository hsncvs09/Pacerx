<script lang="ts">
  import type { Mood, Snapshot } from "../../lib/types";

  interface Props {
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
  }

  let { mood, snapshot, reducedMotion }: Props = $props();

  // Odaklanma yüzdesi hesabı (0.0 -> 1.0)
  let focusProgress = $derived(
    snapshot && snapshot.total_secs > 0
      ? Math.min(1, Math.max(0, (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs))
      : 0
  );

  // Odak süresinin son %20'sindeki yorgunluk (son 5 dakika)
  let isTiredFocus = $derived(mood === "focus" && focusProgress >= 0.8);
</script>

<g class="byte-root mood-{mood}" class:tired={isTiredFocus} class:reduced-motion={reducedMotion}>
  <defs>
    <!-- Ana Gövde 3D Küresel Gradyan (Sol üstten yumuşak ışık kaynağı) -->
    <radialGradient id="byte-body-grad" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#4d6499" />
      <stop offset="45%" stop-color="#344874" />
      <stop offset="85%" stop-color="#212f52" />
      <stop offset="100%" stop-color="#151f38" />
    </radialGradient>

    <!-- Yan ve Alt Gövde Derinlik / Gölge Gradyanı -->
    <linearGradient id="byte-bevel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5a73ac" stop-opacity="0.8" />
      <stop offset="40%" stop-color="#3b4f7d" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0e1526" stop-opacity="0.9" />
    </linearGradient>

    <!-- Ekran Yuvası (İçeri gömülü çerçeve derinliği) -->
    <linearGradient id="byte-bezel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#101726" />
      <stop offset="50%" stop-color="#162035" />
      <stop offset="100%" stop-color="#243354" />
    </linearGradient>

    <!-- Ekran Camı Canlı Fosfor / Turkuaz Parlaması -->
    <radialGradient id="byte-screen-grad" cx="50%" cy="55%" r="62%">
      {#if mood === "focus_sad"}
        <stop offset="0%" stop-color="#5eead4" />
        <stop offset="60%" stop-color="#14b8a6" />
        <stop offset="100%" stop-color="#0f766e" />
      {:else if mood === "warning"}
        <stop offset="0%" stop-color="#fde047" />
        <stop offset="55%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      {:else if mood === "sleeping"}
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.75" />
        <stop offset="65%" stop-color="#0284c7" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.85" />
      {:else}
        <stop offset="0%" stop-color="#67e8f9" />
        <stop offset="45%" stop-color="#22d3ee" />
        <stop offset="85%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#0891b2" />
      {/if}
    </radialGradient>

    <!-- Ekran Cam Yansıması (Kavisli parlama çizgisi için) -->
    <linearGradient id="byte-glare-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>

    <!-- D-Pad 3D Düğme Gradyanı -->
    <linearGradient id="byte-dpad-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a354c" />
      <stop offset="100%" stop-color="#141a27" />
    </linearGradient>

    <!-- Robot Kol ve Ayak Metalik Gradyanı -->
    <linearGradient id="byte-limb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#556c9e" />
      <stop offset="60%" stop-color="#364972" />
      <stop offset="100%" stop-color="#1c2742" />
    </linearGradient>

    <!-- Kravat Gradyanı (Canlı Kırmızı-Bordo) -->
    <linearGradient id="byte-tie-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="40%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#991b1b" />
    </linearGradient>

    <!-- Aksiyon Tuşları 3D Küresel Gradyanlar -->
    <radialGradient id="btn-blue" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#93c5fd" />
      <stop offset="40%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </radialGradient>
    <radialGradient id="btn-red" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fca5a5" />
      <stop offset="40%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </radialGradient>
    <radialGradient id="btn-yellow" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </radialGradient>
    <radialGradient id="btn-green" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#86efac" />
      <stop offset="40%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#15803d" />
    </radialGradient>

    <!-- Zemin Yumuşak Temas Gölgesi -->
    <radialGradient id="byte-ground-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a101d" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#0a101d" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#0a101d" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- ==================== 1. ZEMİN GÖLGESİ ==================== -->
  <ellipse cx="120" cy="214" rx="46" ry="9" fill="url(#byte-ground-shadow)" class="ground-shadow" />

  <!-- ==================== 2. KARAKTER ANA GÖVDE VE UZUVLAR ==================== -->
  <g class="byte-character-group">
    <!-- --- AYAKLAR / BACAKLAR (Arkada) --- -->
    <g class="legs-group">
      <!-- Sol Bacak & Ayak -->
      <g class="leg left-leg">
        <ellipse cx="94" cy="192" rx="12" ry="7" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
        <path d="M 83 191 C 83 203, 90 207, 98 207 C 105 207, 107 202, 106 191 Z" 
              fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.8" stroke-linejoin="round" />
        <!-- Ayak ucu aydınlatması -->
        <ellipse cx="96" cy="202" rx="5" ry="2.2" fill="#ffffff" opacity="0.25" />
      </g>
      <!-- Sağ Bacak & Ayak -->
      <g class="leg right-leg">
        <ellipse cx="146" cy="192" rx="12" ry="7" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
        <path d="M 135 191 C 134 202, 137 207, 144 207 C 152 207, 158 203, 158 191 Z" 
              fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.8" stroke-linejoin="round" />
        <!-- Ayak ucu aydınlatması -->
        <ellipse cx="145" cy="202" rx="5" ry="2.2" fill="#ffffff" opacity="0.25" />
      </g>
    </g>

    <!-- --- ANA GÖVDE (3 Boyutlu Hacimli El Konsolu Kutusu) --- -->
    <g class="torso-group">
      <!-- Dış Koyu Kontur ve Derinlik Tabanı -->
      <rect x="52" y="38" width="136" height="152" rx="34" ry="34" 
            fill="#101726" />
      
      <!-- Ana Hacimli Gövde Bloğu -->
      <rect x="54" y="40" width="132" height="148" rx="32" ry="32" 
            fill="url(#byte-body-grad)" stroke="#141c2e" stroke-width="3" />

      <!-- 3D Pah/Bevel Katmanı: Sağ alt gölge & derinlik -->
      <rect x="54" y="40" width="132" height="148" rx="32" ry="32" 
            fill="url(#byte-bevel-grad)" />

      <!-- Üst ve Sol Kenar Parlaması (Specular Rim Highlight) -->
      <path d="M 88 43 L 152 43 C 172 43, 183 54, 183 72" 
            fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" opacity="0.4" />
      <path d="M 57 72 C 57 56, 68 45, 86 44" 
            fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" opacity="0.45" />

      <!-- --- 3D GÖMÜLÜ EKRAN YUVASI VE CAMI --- -->
      <g class="screen-chassis" transform="translate(120, 93)">
        <!-- Çukur Ekran Yuvası (Recessed Bezel) -->
        <rect x="-53" y="-39" width="106" height="78" rx="20" ry="20" 
              fill="url(#byte-bezel-grad)" stroke="#0c121e" stroke-width="3" />

        <!-- İç Yuva Gölgesi (Alt kenara doğru derinleşen gölge) -->
        <rect x="-51" y="-37" width="102" height="74" rx="18" ry="18" 
              fill="#090e17" opacity="0.75" />

        <!-- Parlayan CRT / Cam Ekran -->
        <rect x="-48" y="-34" width="96" height="68" rx="16" ry="16" 
              fill="url(#byte-screen-grad)" stroke="#164e63" stroke-width="2" class="crt-screen" />

        <!-- Ekran Cam Yansıması (Sol-Üst Açılı Saydam Parlama) -->
        <path d="M -44 -30 L 16 -30 C 38 -30, 44 -24, 44 -6 C 44 14, 20 -4, -18 -4 C -36 -4, -44 -16, -44 -30 Z" 
              fill="url(#byte-glare-grad)" />

        <!-- --- YÜZ İFADELERİ (Ekranda Canlı Gösterim) --- -->
        <g class="face-display">
          {#if mood === "sleeping"}
            <!-- Uyku: Sakin kavisli kapalı gözler -->
            <path d="M -28 -4 Q -20 2 -12 -4" fill="none" stroke="#0e2338" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 12 -4 Q 20 2 28 -4" fill="none" stroke="#0e2338" stroke-width="4.5" stroke-linecap="round" />
            <!-- Küçük huzurlu nefes ağzı -->
            <ellipse cx="0" cy="11" rx="3.5" ry="3.5" fill="#0e2338" />

          {:else if mood === "celebrate"}
            <!-- Kutlama: Coşkulu yıldız / yukarı ok gözler (`^ ^`) ve neşeli açık ağız -->
            <path d="M -28 0 L -20 -10 L -12 0" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M 12 0 L 20 -10 L 28 0" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M -11 8 Q 0 22 11 8 Z" fill="#ffffff" stroke="#083344" stroke-width="2" />

          {:else if mood === "focus_sad"}
            <!-- Yorgun / Üzgün: Düşük kaşlar, hüzünlü gözler ve kıvrık ağız -->
            <path d="M -28 -8 Q -20 -2 -12 -8" fill="none" stroke="#0f2930" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 12 -8 Q 20 -2 28 -8" fill="none" stroke="#0f2930" stroke-width="4.5" stroke-linecap="round" />
            <ellipse cx="-20" cy="1" rx="5.5" ry="6.5" fill="#0f2930" />
            <ellipse cx="20" cy="1" rx="5.5" ry="6.5" fill="#0f2930" />
            <!-- Hüzünlü ters gülüş -->
            <path d="M -9 15 Q 0 8 9 15" fill="none" stroke="#0f2930" stroke-width="3.8" stroke-linecap="round" />
            <!-- Ter / gözyaşı parıltısı -->
            <circle cx="-13" cy="4" r="2.2" fill="#a7f3d0" />

          {:else if mood === "warning"}
            <!-- Uyarı: Memnuniyetsiz / Sinirli İfade (Çatık kaşlar, kısık öfkeli gözler, ters hoşnutsuz ağız) -->
            <!-- Sol Çatık Kaş (Merkeze doğru sert eğim) -->
            <path d="M -29 -12 L -11 -4" fill="none" stroke="#1c1917" stroke-width="4.4" stroke-linecap="round" />
            <!-- Sağ Çatık Kaş -->
            <path d="M 29 -12 L 11 -4" fill="none" stroke="#1c1917" stroke-width="4.4" stroke-linecap="round" />
            <!-- Sol Kısık Öfkeli Göz -->
            <ellipse cx="-20" cy="2" rx="6.5" ry="4.5" fill="#1c1917" />
            <circle cx="-18" cy="0.5" r="1.6" fill="#ffffff" />
            <!-- Sağ Kısık Öfkeli Göz -->
            <ellipse cx="20" cy="2" rx="6.5" ry="4.5" fill="#1c1917" />
            <circle cx="18" cy="0.5" r="1.6" fill="#ffffff" />
            <!-- Hoşnutsuz Ters Eğri Ağız (Memnuniyetsiz grimace) -->
            <path d="M -11 15 Q 0 8 11 13" fill="none" stroke="#1c1917" stroke-width="4" stroke-linecap="round" />

          {:else if mood === "nag"}
            <!-- Israr: Sevimli İri Yalvaran Gözler (`🥺`) -->
            <ellipse cx="-20" cy="-3" rx="7" ry="8.5" fill="#1c1917" />
            <ellipse cx="20" cy="-3" rx="7" ry="8.5" fill="#1c1917" />
            <circle cx="-22" cy="-6" r="2.8" fill="#ffffff" />
            <circle cx="18" cy="-6" r="2.8" fill="#ffffff" />
            <circle cx="-18" cy="-1" r="1.4" fill="#ffffff" />
            <circle cx="22" cy="-1" r="1.4" fill="#ffffff" />
            <!-- Endişeli küçük 'o' ağız -->
            <ellipse cx="0" cy="13" rx="4.5" ry="5.5" fill="#1c1917" />

          {:else if isTiredFocus}
            <!-- Son 5 dk Focus Yorgunluğu: Yarı kapalı ağır gözler -->
            <path d="M -27 -6 Q -20 -3 -13 -6" fill="none" stroke="#0c2338" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 13 -6 Q 20 -3 27 -6" fill="none" stroke="#0c2338" stroke-width="4.5" stroke-linecap="round" />
            <ellipse cx="-20" cy="0" rx="5" ry="5" fill="#0c2338" />
            <ellipse cx="20" cy="0" rx="5" ry="5" fill="#0c2338" />
            <path d="M -7 13 Q 0 16 7 13" fill="none" stroke="#0c2338" stroke-width="3.2" stroke-linecap="round" />

          {:else}
            <!-- Standart Canlı / Dostane İfade (Idle, Focus, Walking, Poked, Dragged) -->
            <!-- Sol Dijital Göz -->
            <ellipse cx="-20" cy="-4" rx="5.5" ry="8.5" fill="#08253a" class="pupil" />
            <ellipse cx="-21.5" cy="-7" rx="2.4" ry="3.2" fill="#ffffff" opacity="0.9" />
            <!-- Sağ Dijital Göz -->
            <ellipse cx="20" cy="-4" rx="5.5" ry="8.5" fill="#08253a" class="pupil" />
            <ellipse cx="18.5" cy="-7" rx="2.4" ry="3.2" fill="#ffffff" opacity="0.9" />
            <!-- Sevimli Kıvrık Gülümseme -->
            <path d="M -8 10 Q 0 16 8 10" fill="none" stroke="#08253a" stroke-width="3.6" stroke-linecap="round" />
          {/if}
        </g>
      </g>

      <!-- --- KIRMIZI-BEYAZ ÇİZGİLİ ŞIK KRAVAT (Görseldeki İkonik Parça) --- -->
      <!-- focus_sad modunda kravat hafif gevşemiş ve yamulmuş görünür -->
      {#if mood !== "focus_sad"}
        <g class="necktie" transform="translate(120, 137)">
          <!-- Düğüm -->
          <polygon points="-7,0 7,0 5,6 -5,6" fill="#b91c1c" stroke="#111827" stroke-width="2" />
          <!-- Kravat Gövdesi -->
          <polygon points="-6,6 6,6 8,24 0,31 -8,24" fill="url(#byte-tie-grad)" stroke="#111827" stroke-width="2" />
          <!-- Beyaz Çapraz Çizgiler -->
          <path d="M -5 10 L 6 15" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
          <path d="M -6 16 L 7 21" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
          <path d="M -6 22 L 4 27" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
        </g>
      {:else}
        <!-- focus_sad: Düşük / yana kaymış yorgun kravat -->
        <g class="necktie sad-tie" transform="translate(121, 139) rotate(8)">
          <polygon points="-6,0 6,0 4,5 -4,5" fill="#991b1b" stroke="#111827" stroke-width="1.8" />
          <polygon points="-5,5 5,5 6,22 0,27 -6,22" fill="#991b1b" stroke="#111827" stroke-width="1.8" />
          <path d="M -4 9 L 5 14" stroke="#ffffff" stroke-width="2" opacity="0.8" />
          <path d="M -5 15 L 5 20" stroke="#ffffff" stroke-width="2" opacity="0.8" />
        </g>
      {/if}

      <!-- --- KONSOL TUŞLARI (D-Pad ve 4 Renkli Düğme) --- -->
      <!-- Sol Taraf: 3 Boyutlu D-Pad -->
      <g class="dpad-group" transform="translate(86, 158)">
        <!-- D-Pad Zemin Yuvası -->
        <circle cx="0" cy="0" r="16" fill="#141c2c" opacity="0.6" />
        <!-- 3D Artı Tuşu Taban Derinliği -->
        <path d="M -4 -12 L 4 -12 L 4 -4 L 12 -4 L 12 4 L 4 4 L 4 12 L -4 12 L -4 4 L -12 4 L -12 -4 L -4 -4 Z" 
              fill="#0d131f" />
        <!-- 3D Artı Tuşu Üst Yüzeyi -->
        <path d="M -4 -13 L 4 -13 L 4 -4 L 13 -4 L 13 4 L 4 4 L 4 13 L -4 13 L -4 4 L -13 4 L -13 -4 L -4 -4 Z" 
              fill="url(#byte-dpad-grad)" stroke="#1a2336" stroke-width="1.2" />
        <!-- Tuş Üzeri Yön Kabartmaları -->
        <polygon points="0,-10 -2,-8 2,-8" fill="#475569" />
        <polygon points="0,10 -2,8 2,8" fill="#475569" />
        <polygon points="-10,0 -8,-2 -8,2" fill="#475569" />
        <polygon points="10,0 8,-2 8,2" fill="#475569" />
        <circle cx="0" cy="0" r="2.2" fill="#1e293b" />
      </g>

      <!-- Sağ Taraf: 4 Renkli 3D Düğme (Mavi, Kırmızı, Sarı, Yeşil) -->
      <g class="action-buttons-group" transform="translate(154, 158)">
        <!-- Düğmeler Zemin Çukuru -->
        <circle cx="0" cy="0" r="17" fill="#141c2c" opacity="0.6" />
        
        <!-- Üst Düğme (Mavi) -->
        <g transform="translate(0, -9)">
          <circle cx="0" cy="1" r="5" fill="#1e3a8a" />
          <circle cx="0" cy="0" r="5" fill="url(#btn-blue)" stroke="#172554" stroke-width="0.8" />
          <circle cx="-1.5" cy="-1.5" r="1.4" fill="#ffffff" opacity="0.75" />
        </g>
        <!-- Sağ Düğme (Kırmızı) -->
        <g transform="translate(9, 0)">
          <circle cx="0" cy="1" r="5" fill="#7f1d1d" />
          <circle cx="0" cy="0" r="5" fill="url(#btn-red)" stroke="#450a0a" stroke-width="0.8" />
          <circle cx="-1.5" cy="-1.5" r="1.4" fill="#ffffff" opacity="0.75" />
        </g>
        <!-- Alt Düğme (Sarı) -->
        <g transform="translate(0, 9)">
          <circle cx="0" cy="1" r="5" fill="#713f12" />
          <circle cx="0" cy="0" r="5" fill="url(#btn-yellow)" stroke="#422006" stroke-width="0.8" />
          <circle cx="-1.5" cy="-1.5" r="1.4" fill="#ffffff" opacity="0.75" />
        </g>
        <!-- Sol Düğme (Yeşil) -->
        <g transform="translate(-9, 0)">
          <circle cx="0" cy="1" r="5" fill="#14532d" />
          <circle cx="0" cy="0" r="5" fill="url(#btn-green)" stroke="#052e16" stroke-width="0.8" />
          <circle cx="-1.5" cy="-1.5" r="1.4" fill="#ffffff" opacity="0.75" />
        </g>
      </g>
    </g>

    <!-- --- ROBOTİK KOLLAR VE ELLER --- -->
    <g class="arms-group">
      {#if mood === "celebrate"}
        <!-- Kutlama: Havaya kalkan coşkulu kollar (`\o/`) -->
        <!-- Sol Kol Havada -->
        <g class="arm-celebrate-left">
          <circle cx="48" cy="100" r="7" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <!-- Segmentli kol boğumları -->
          <path d="M 46 96 C 36 78, 28 64, 34 46" fill="none" stroke="url(#byte-limb-grad)" stroke-width="9" stroke-linecap="round" />
          <circle cx="34" cy="46" r="8" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <!-- Yuvarlak robotik el ve başparmak -->
          <circle cx="33" cy="40" r="7.5" fill="#2d3f66" stroke="#111827" stroke-width="2" />
          <path d="M 38 41 C 43 40, 44 44, 40 47" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" />
        </g>
        <!-- Sağ Kol Havada -->
        <g class="arm-celebrate-right">
          <circle cx="192" cy="100" r="7" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <path d="M 194 96 C 204 78, 212 64, 206 46" fill="none" stroke="url(#byte-limb-grad)" stroke-width="9" stroke-linecap="round" />
          <circle cx="206" cy="46" r="8" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <circle cx="207" cy="40" r="7.5" fill="#2d3f66" stroke="#111827" stroke-width="2" />
          <path d="M 202 41 C 197 40, 196 44, 200 47" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" />
        </g>

      {:else}
        <!-- Standart / Idle / Focus / Sad Duruşu: İki yanda doğal ve serbest sarkan segmentli kollar -->
        <!-- Sol Kol -->
        <g class="arm default-arm left-arm">
          <!-- Omuz Mafsalı -->
          <circle cx="51" cy="115" r="7.5" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <!-- Segmentli Eğri Kol (Üç boyutlu silindir hissi) -->
          <path d="M 50 117 C 32 128, 28 150, 36 166" fill="none" stroke="url(#byte-limb-grad)" stroke-width="8.5" stroke-linecap="round" />
          <!-- Kol Segment Çizgileri -->
          <path d="M 42 130 C 40 134, 43 138, 47 137" fill="none" stroke="#101726" stroke-width="2" />
          <path d="M 34 146 C 33 150, 36 154, 40 152" fill="none" stroke="#101726" stroke-width="2" />
          <!-- Tombul Yuvarlak Robot El & Başparmak -->
          <circle cx="36" cy="168" r="8" fill="#2e4067" stroke="#111827" stroke-width="2.2" />
          <ellipse cx="37" cy="169" rx="3.5" ry="2" fill="#ffffff" opacity="0.3" />
        </g>
        <!-- Sağ Kol (Idle modunda periyodik el sallar) -->
        <g class="arm default-arm right-arm">
          <circle cx="189" cy="115" r="7.5" fill="url(#byte-limb-grad)" stroke="#111827" stroke-width="2.5" />
          <path d="M 190 117 C 208 128, 212 150, 204 166" fill="none" stroke="url(#byte-limb-grad)" stroke-width="8.5" stroke-linecap="round" />
          <path d="M 198 130 C 200 134, 197 138, 193 137" fill="none" stroke="#101726" stroke-width="2" />
          <path d="M 206 146 C 207 150, 204 154, 200 152" fill="none" stroke="#101726" stroke-width="2" />
          <circle cx="204" cy="168" r="8" fill="#2e4067" stroke="#111827" stroke-width="2.2" />
          <ellipse cx="203" cy="169" rx="3.5" ry="2" fill="#ffffff" opacity="0.3" />
        </g>
      {/if}
    </g>
  </g>

  <!-- ==================== 3. MODA ÖZEL PARTİKÜLLER VE EFEKTLER ==================== -->
  {#if mood === "celebrate"}
    <!-- Kutlama Konfetileri ve Parlayan Yıldızlar -->
    <g class="celebrate-fx">
      <!-- Yıldızlar -->
      <polygon points="40,48 43,54 50,55 45,60 46,67 40,63 34,67 35,60 30,55 37,54" fill="#facc15" class="star s1" />
      <polygon points="200,52 202,57 208,58 203,62 204,68 200,65 196,68 197,62 192,58 198,57" fill="#38bdf8" class="star s2" />
      <!-- Renkli Konfeti Parçacıkları -->
      <circle cx="36" cy="78" r="3.5" fill="#f87171" class="confetti c1" />
      <circle cx="58" cy="34" r="3" fill="#4ade80" class="confetti c2" />
      <circle cx="182" cy="30" r="3.5" fill="#fbbf24" class="confetti c3" />
      <circle cx="206" cy="80" r="3.5" fill="#ec4899" class="confetti c4" />
      <!-- Kıvrık Kurdele Parçacıkları -->
      <path d="M 45 92 Q 40 98 48 104" fill="none" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round" />
      <path d="M 195 92 Q 202 98 194 104" fill="none" stroke="#f43f5e" stroke-width="2.6" stroke-linecap="round" />
    </g>
  {/if}

  {#if mood === "sleeping"}
    <!-- Uykulu Turkuaz "Zzz" Partikülleri -->
    <g class="zzz-fx">
      <text x="180" y="58" font-size="13" font-family="'Segoe UI', sans-serif" font-weight="900" fill="#22d3ee" opacity="0.85" class="z1">Z</text>
      <text x="194" y="42" font-size="16" font-family="'Segoe UI', sans-serif" font-weight="900" fill="#22d3ee" opacity="0.65" class="z2">z</text>
      <text x="210" y="26" font-size="20" font-family="'Segoe UI', sans-serif" font-weight="900" fill="#22d3ee" opacity="0.45" class="z3">z</text>
    </g>
  {/if}
</g>

<style>
  /* =======================================================
     CSS Animasyonları & Hacimli Davranış Kuralları
     ======================================================= */
  .byte-root {
    --bounce-timing: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .byte-character-group {
    transform-origin: 120px 200px;
  }

  .left-arm { transform-origin: 51px 115px; }
  .right-arm { transform-origin: 189px 115px; }
  .left-leg { transform-origin: 94px 192px; }
  .right-leg { transform-origin: 146px 192px; }
  .ground-shadow { transform-origin: 120px 214px; }

  /* --- IDLE (Sakin Canlı Nefes ve Doğal Kol Salınımı) --- */
  .mood-idle .byte-character-group {
    animation: idleBreathe 3s ease-in-out infinite;
  }
  .mood-idle .left-arm {
    animation: armSwayLeft 3s ease-in-out infinite;
  }
  .mood-idle .right-arm {
    animation: armSwayRight 3s ease-in-out infinite;
  }
  .mood-idle .ground-shadow {
    animation: shadowPulse 3s ease-in-out infinite;
  }

  /* --- FOCUS (Konsantre, Kararlı, Kollar Serbest) --- */
  .mood-focus .byte-character-group {
    animation: focusConcentrate 4s ease-in-out infinite;
  }
  .mood-focus .left-arm {
    animation: armSwayLeft 4s ease-in-out infinite;
  }
  .mood-focus .right-arm {
    animation: armSwayRight 4s ease-in-out infinite;
  }

  /* --- FOCUS_SAD (Yorgun, Çökmüş, Molasız Çalışma) --- */
  .mood-focus_sad .byte-character-group {
    animation: sadSlump 4.5s ease-in-out infinite;
  }
  .mood-focus_sad .left-arm {
    animation: sadArmLeft 4.5s ease-in-out infinite;
  }
  .mood-focus_sad .right-arm {
    animation: sadArmRight 4.5s ease-in-out infinite;
  }

  /* --- CELEBRATE (Zafer Zıplaması ve Havada Süzülme) --- */
  .mood-celebrate .byte-character-group {
    animation: victoryJump 0.65s ease-out infinite alternate;
  }
  .mood-celebrate .ground-shadow {
    animation: victoryShadow 0.65s ease-out infinite alternate;
  }
  .mood-celebrate .arm-celebrate-left {
    animation: waveCheerLeft 0.35s ease-in-out infinite alternate;
    transform-origin: 48px 100px;
  }
  .mood-celebrate .arm-celebrate-right {
    animation: waveCheerRight 0.35s ease-in-out infinite alternate;
    transform-origin: 192px 100px;
  }
  .celebrate-fx .star { animation: starPop 1.2s ease-in-out infinite alternate; }
  .celebrate-fx .s2 { animation-delay: 0.4s; }
  .celebrate-fx .confetti { animation: confettiFloat 1.8s linear infinite; }

  /* --- WALKING (Neşeli Yürüyüş / Adım Hareketi) --- */
  .mood-walking .byte-character-group {
    animation: walkBodyBob 0.8s ease-in-out infinite;
  }
  .mood-walking .left-leg {
    animation: walkStepLeft 0.8s ease-in-out infinite;
  }
  .mood-walking .right-leg {
    animation: walkStepRight 0.8s ease-in-out infinite;
  }
  .mood-walking .left-arm {
    animation: walkArmSwingLeft 0.8s ease-in-out infinite;
  }
  .mood-walking .right-arm {
    animation: walkArmSwingRight 0.8s ease-in-out infinite;
  }

  /* --- WARNING & NAG (Titreşen Dikkat Çekme / Israr) --- */
  .mood-warning .byte-character-group,
  .mood-nag .byte-character-group {
    animation: warningJitter 0.35s ease-in-out infinite;
  }

  /* --- POKED (Squash & Stretch Tıklama Reaksiyonu) --- */
  .mood-poked .byte-character-group {
    animation: pokeSquash 0.55s var(--bounce-timing);
  }

  /* --- DRAGGED (Havada Taşınma / Denge Salınımı) --- */
  .mood-dragged .byte-character-group {
    animation: dragFloat 0.75s ease-in-out infinite alternate;
  }

  /* --- SLEEPING (Derin Uyku ve Zzz Partikülleri) --- */
  .mood-sleeping .byte-character-group {
    animation: sleepBreath 5s ease-in-out infinite;
    opacity: 0.9;
  }
  .zzz-fx text {
    animation: zzzRise 2.8s linear infinite;
  }
  .zzz-fx .z2 { animation-delay: 0.9s; }
  .zzz-fx .z3 { animation-delay: 1.8s; }

  /* =======================================================
     KEYFRAMES (Optimize Vektör Animasyonları)
     ======================================================= */
  @keyframes idleBreathe {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(2px) scale(1.015, 0.985); }
  }
  @keyframes shadowPulse {
    0%, 100% { transform: scale(1); opacity: 0.45; }
    50% { transform: scale(1.06); opacity: 0.55; }
  }
  @keyframes armSwayLeft {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-5deg); }
  }
  @keyframes armSwayRight {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(5deg); }
  }

  @keyframes focusConcentrate {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(1.5px); }
  }
  @keyframes sadSlump {
    0%, 100% { transform: translateY(3px) scale(0.98, 0.96); }
    50% { transform: translateY(6px) scale(0.96, 0.93); }
  }
  @keyframes sadArmLeft {
    0%, 100% { transform: rotate(4deg) translateY(2px); }
    50% { transform: rotate(7deg) translateY(4px); }
  }
  @keyframes sadArmRight {
    0%, 100% { transform: rotate(-4deg) translateY(2px); }
    50% { transform: rotate(-7deg) translateY(4px); }
  }
  @keyframes victoryJump {
    0% { transform: translateY(0) scale(1, 0.96); }
    100% { transform: translateY(-22px) scale(0.97, 1.04); }
  }
  @keyframes victoryShadow {
    0% { transform: scale(1.05); opacity: 0.5; }
    100% { transform: scale(0.65); opacity: 0.2; }
  }
  @keyframes waveCheerLeft {
    0% { transform: rotate(-15deg); }
    100% { transform: rotate(-45deg); }
  }
  @keyframes waveCheerRight {
    0% { transform: rotate(15deg); }
    100% { transform: rotate(45deg); }
  }
  @keyframes walkBodyBob {
    0%, 100% { transform: translateY(0) rotate(-1.5deg); }
    50% { transform: translateY(-5px) rotate(1.5deg); }
  }
  @keyframes walkStepLeft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px) rotate(10deg); }
  }
  @keyframes walkStepRight {
    0%, 100% { transform: translateY(-7px) rotate(-10deg); }
    50% { transform: translateY(0); }
  }
  @keyframes walkArmSwingLeft {
    0%, 100% { transform: rotate(-12deg); }
    50% { transform: rotate(12deg); }
  }
  @keyframes walkArmSwingRight {
    0%, 100% { transform: rotate(12deg); }
    50% { transform: rotate(-12deg); }
  }
  @keyframes warningJitter {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2.5px) rotate(-1deg); }
    75% { transform: translateX(2.5px) rotate(1deg); }
  }
  @keyframes pokeSquash {
    0% { transform: scale(1); }
    25% { transform: scale(1.2, 0.8) translateY(8px); }
    55% { transform: scale(0.9, 1.15) translateY(-10px); }
    80% { transform: scale(1.05, 0.95) translateY(2px); }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes dragFloat {
    0% { transform: rotate(-4deg) translateY(-2px); }
    100% { transform: rotate(4deg) translateY(3px); }
  }
  @keyframes sleepBreath {
    0%, 100% { transform: scale(1) translateY(0); }
    50% { transform: scale(1.02, 0.98) translateY(2.5px); }
  }
  @keyframes zzzRise {
    0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
    40% { opacity: 0.85; }
    100% { transform: translate(16px, -28px) scale(1.15); opacity: 0; }
  }
  @keyframes starPop {
    0% { transform: scale(0.85) rotate(0deg); }
    100% { transform: scale(1.15) rotate(15deg); }
  }
  @keyframes confettiFloat {
    0% { transform: translateY(0); opacity: 0.9; }
    100% { transform: translateY(-16px); opacity: 0.1; }
  }

  /* Erişilebilirlik (Reduced Motion) */
  .reduced-motion :global(*) {
    animation: none !important;
    transition: none !important;
  }
</style>
