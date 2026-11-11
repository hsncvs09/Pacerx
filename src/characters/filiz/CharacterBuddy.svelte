<script lang="ts">
  import type { Mood, Snapshot } from "../../lib/types";

  interface Props {
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
  }

  let { mood, snapshot, reducedMotion }: Props = $props();

  // Odak ilerleme oranı (0.0 -> 1.0)
  let focusProgress = $derived(
    snapshot.total_secs > 0
      ? Math.min(1, Math.max(0, (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs))
      : 0
  );

  // Son %20 odak yorgunluğu (son 5 dakika)
  let isLateFocus = $derived(mood === "focus" && focusProgress >= 0.8);

  // Saksı kemeri üzerindeki odak çubuğu genişliği (maksimum 88px)
  let progressBarWidth = $derived(Math.max(4, Math.round(88 * focusProgress)));

  // Modlara göre dinamik renk paleti
  let palette = $derived.by(() => {
    if (mood === "focus_sad") {
      return {
        leaf1: "#849b68", leaf2: "#556343",
        stem1: "#849b68", stem2: "#4c573c",
        pot1: "#b56e57", pot2: "#8f4c36",
        aura: "#849b68", bud: "#849b68", soil: "#634935"
      };
    }
    if (isLateFocus) {
      return {
        leaf1: "#95b851", leaf2: "#5f7d32",
        stem1: "#95b851", stem2: "#4d6b2b",
        pot1: "#d97659", pot2: "#b8522e",
        aura: "#eab308", bud: "#a3c25d", soil: "#573f2d"
      };
    }
    if (mood === "warning") {
      return {
        leaf1: "#f59e0b", leaf2: "#b45309",
        stem1: "#fbbf24", stem2: "#b45309",
        pot1: "#ea580c", pot2: "#9a3412",
        aura: "#f59e0b", bud: "#fbbf24", soil: "#4a3525"
      };
    }
    if (mood === "walking" || mood === "celebrate") {
      return {
        leaf1: "#40c057", leaf2: "#1b7a3d",
        stem1: "#69db7c", stem2: "#2b8a3e",
        pot1: "#e58267", pot2: "#cc5c33",
        aura: "#38bdf8", bud: "#69db7c", soil: "#3b281a"
      };
    }
    if (mood === "sleeping") {
      return {
        leaf1: "#388e72", leaf2: "#1e4d3e",
        stem1: "#489e82", stem2: "#1e4d3e",
        pot1: "#bf6952", pot2: "#964528",
        aura: "#6366f1", bud: "#52b788", soil: "#3d2c1e"
      };
    }
    return {
      leaf1: "#52b788", leaf2: "#2d6a4f",
      stem1: "#74c69d", stem2: "#2d6a4f",
      pot1: "#e07a5f", pot2: "#c85a32",
      aura: "#52b788", bud: "#74c69d", soil: "#4a3525"
    };
  });
</script>

<!-- Dış <svg viewBox="0 0 240 240"> CharacterStage.svelte tarafından sağlanır -->
<g class="sprout-root mood-{mood}" class:is-fatigued={isLateFocus} class:reduced-motion={reducedMotion}>
  <defs>
    <linearGradient id="sprout-pot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={palette.pot1} />
      <stop offset="65%" stop-color={palette.pot2} />
      <stop offset="100%" stop-color="#9e3f1f" />
    </linearGradient>

    <linearGradient id="sprout-rim-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#eb8a70" />
      <stop offset="50%" stop-color="#d66843" />
      <stop offset="100%" stop-color="#b04927" />
    </linearGradient>

    <linearGradient id="sprout-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={palette.leaf1} />
      <stop offset="100%" stop-color={palette.leaf2} />
    </linearGradient>

    <linearGradient id="sprout-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color={palette.stem1} />
      <stop offset="100%" stop-color={palette.stem2} />
    </linearGradient>

    <!-- Performans Kuralı: feGaussianBlur yerine radyal vektör degrade -->
    <radialGradient id="sprout-aura-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={palette.aura} stop-opacity="0.22" />
      <stop offset="65%" stop-color={palette.aura} stop-opacity="0.06" />
      <stop offset="100%" stop-color={palette.aura} stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- 1. BASE LAYER: Zemin Gölgesi, Saksı, Toprak ve Odak İlerleme Çubuğu -->
  <g class="base-layer">
    <circle cx="120" cy="128" r="88" fill="url(#sprout-aura-grad)" />

    <g class="ground-shadow">
      <ellipse cx="120" cy="212" rx="52" ry="9" fill="#090d16" opacity="0.26" />
      <ellipse cx="120" cy="212" rx="36" ry="5.5" fill="#090d16" opacity="0.18" />
    </g>

    <g class="sprout-body">
      <g class="pot-assembly">
        <!-- Toprak Katmanı -->
        <ellipse cx="120" cy="134" rx="46" ry="9" fill={palette.soil} />
        {#if mood === "focus_sad" || isLateFocus}
          <g opacity={mood === "focus_sad" ? 0.85 : 0.4}>
            <path d="M 96 133 L 108 136 L 115 132" fill="none" stroke="#2b1d12" stroke-width="1.8" stroke-linecap="round" />
            <path d="M 128 135 L 138 132 L 145 136" fill="none" stroke="#2b1d12" stroke-width="1.8" stroke-linecap="round" />
          </g>
        {/if}

        <!-- Terracotta Saksı Gövdesi -->
        <path d="M 74 140 L 166 140 L 152 204 C 150 209 144 212 138 212 L 102 212 C 96 212 90 209 88 204 Z" fill="url(#sprout-pot-grad)" />
        <path d="M 80 146 L 86 146 L 96 203 L 91 203 Z" fill="#ffffff" opacity="0.16" />
        <path d="M 155 146 L 162 146 L 150 204 C 148 208 143 210 138 210 L 125 210 C 138 206 146 192 155 146 Z" fill="#3d160a" opacity="0.22" />

        <!-- Saksı Kemeri (Rim) -->
        <rect x="66" y="128" width="108" height="16" rx="7" fill="url(#sprout-rim-grad)" />
        <path d="M 73 131 L 167 131" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.22" />

        <!-- Focus İlerleme Çizgisi -->
        {#if mood === "focus"}
          <g class="focus-bar">
            <rect x="76" y="134" width="88" height="5" rx="2.5" fill="#2d1810" opacity="0.55" />
            <rect
              x="76"
              y="134"
              width={progressBarWidth}
              height="5"
              rx="2.5"
              fill={isLateFocus ? "#f59e0b" : "#74c69d"}
            />
            <circle cx={76 + progressBarWidth} cy="136.5" r="3.5" fill="#d8f3dc" opacity="0.9" />
          </g>
        {/if}

        <!-- 2. ACCENT LAYER: Esnek Bitki Sapı, Yapraklar ve Tomurcuk/Çiçek -->
        <g class="accent-layer">
          <g class="stem-assembly">
            <path d="M 120 132 Q 117 96 120 64" fill="none" stroke="url(#sprout-stem-grad)" stroke-width="6.5" stroke-linecap="round" />

            <!-- Sol Yaprak -->
            <g class="leaf-left">
              <path d="M 118 102 C 92 100 64 84 62 60 C 84 54 112 74 118 102 Z" fill="url(#sprout-leaf-grad)" />
              <path d="M 116 100 Q 90 84 72 67" fill="none" stroke="#b7e4c7" stroke-width="2" stroke-linecap="round" opacity="0.55" />
              {#if mood === "warning"}
                <path d="M 88 62 L 84 52 L 96 64 M 72 78 L 62 76 L 76 86" fill="#f59e0b" />
              {/if}
            </g>

            <!-- Sağ Yaprak -->
            <g class="leaf-right">
              <path d="M 122 96 C 148 94 176 78 178 54 C 156 48 128 68 122 96 Z" fill="url(#sprout-leaf-grad)" />
              <path d="M 124 94 Q 150 78 168 61" fill="none" stroke="#b7e4c7" stroke-width="2" stroke-linecap="round" opacity="0.55" />
              {#if mood === "warning"}
                <path d="M 152 56 L 156 46 L 144 58 M 168 72 L 178 70 L 164 80" fill="#f59e0b" />
              {/if}
            </g>

            <!-- Tepe Tomurcuk veya Açmış Çiçek -->
            <g class="top-bud-group">
              {#if mood === "celebrate"}
                <g class="flower-bloom">
                  <circle cx="120" cy="40" r="9.5" fill="#ff758f" />
                  <circle cx="135" cy="49" r="9.5" fill="#ff8fa3" />
                  <circle cx="130" cy="65" r="9.5" fill="#ff758f" />
                  <circle cx="110" cy="65" r="9.5" fill="#ff8fa3" />
                  <circle cx="105" cy="49" r="9.5" fill="#ff758f" />
                  <circle cx="120" cy="53" r="9" fill="#ffb703" />
                </g>
              {:else if mood === "sleeping"}
                <path d="M 120 68 C 106 56 108 36 120 28 C 132 36 134 56 120 68 Z" fill="#4f46e5" opacity="0.85" />
                <circle cx="120" cy="46" r="5" fill="#a5b4fc" opacity="0.75" />
              {:else}
                <path d="M 120 66 C 110 56 111 40 120 32 C 129 40 130 56 120 66 Z" fill={palette.bud} />
                <path d="M 120 62 C 115 54 116 44 120 38 C 124 44 125 54 120 62 Z" fill="#b7e4c7" opacity="0.7" />
              {/if}
            </g>
          </g>
        </g>

        <!-- 3. EXPRESSION LAYER: Saksı Yüzü İfadeleri -->
        <g class="expression-layer">
          <ellipse cx="93" cy="174" rx="6.5" ry="3.8" fill="#ff8fa3" opacity="0.45" />
          <ellipse cx="147" cy="174" rx="6.5" ry="3.8" fill="#ff8fa3" opacity="0.45" />

          {#if mood === "idle" || mood === "walking"}
            <g class="eye-blink">
              <circle cx="102" cy="166" r="5.2" fill="#2b1810" />
              <circle cx="100.2" cy="164" r="2" fill="#ffffff" />
              <circle cx="138" cy="166" r="5.2" fill="#2b1810" />
              <circle cx="136.2" cy="164" r="2" fill="#ffffff" />
              <path d="M 114 174 Q 120 180 126 174" fill="none" stroke="#2b1810" stroke-width="2.8" stroke-linecap="round" />
            </g>
          {:else if mood === "focus"}
            <g>
              <circle cx="102" cy="167" r="4.8" fill="#2b1810" />
              <circle cx="138" cy="167" r="4.8" fill="#2b1810" />
              <path d="M 95 160 Q 102 162 109 161" fill="none" stroke="#2b1810" stroke-width="2.2" stroke-linecap="round" />
              <path d="M 131 161 Q 138 162 145 160" fill="none" stroke="#2b1810" stroke-width="2.2" stroke-linecap="round" />
              <path d="M 116 175 Q 120 177 124 175" fill="none" stroke="#2b1810" stroke-width="2.6" stroke-linecap="round" />
            </g>
          {:else if mood === "focus_sad"}
            <!-- Sad Focus: Gözler açık, uykuda değil, bitkin ve yorgun odaklanmış ifade -->
            <g>
              <!-- Açık ve Yorgun Gözbebekleri -->
              <ellipse cx="102" cy="168" rx="4.6" ry="4" fill="#2b1810" />
              <circle cx="100.5" cy="166.5" r="1.4" fill="#ffffff" opacity="0.8" />
              <ellipse cx="138" cy="168" rx="4.6" ry="4" fill="#2b1810" />
              <circle cx="136.5" cy="166.5" r="1.4" fill="#ffffff" opacity="0.8" />
              <!-- Ağırlaşmış Yarı İnmiş Üst Göz Kapakları -->
              <path d="M 95 165 Q 102 168 109 165" fill="none" stroke="#2b1810" stroke-width="2.4" stroke-linecap="round" />
              <path d="M 131 165 Q 138 168 145 165" fill="none" stroke="#2b1810" stroke-width="2.4" stroke-linecap="round" />
              <!-- Hüzünlü / Yorgun Kaşlar -->
              <path d="M 96 159 Q 102 161.5 109 163" fill="none" stroke="#2b1810" stroke-width="2" stroke-linecap="round" />
              <path d="M 144 159 Q 138 161.5 131 163" fill="none" stroke="#2b1810" stroke-width="2" stroke-linecap="round" />
              <!-- Yorgun Göz Altı Çizgileri -->
              <path d="M 97 173 Q 102 174.5 107 173" fill="none" stroke="#2b1810" stroke-width="1.4" stroke-linecap="round" opacity="0.45" />
              <path d="M 133 173 Q 138 174.5 143 173" fill="none" stroke="#2b1810" stroke-width="1.4" stroke-linecap="round" opacity="0.45" />
              <!-- Yorgun Ağız -->
              <path d="M 115 178 Q 120 174 125 178" fill="none" stroke="#2b1810" stroke-width="2.4" stroke-linecap="round" />
              <!-- Yorgunluk damlası -->
              <circle cx="147" cy="170" r="1.5" fill="#849b68" opacity="0.8" />
            </g>
          {:else if mood === "warning"}
            <g>
              <circle cx="102" cy="167" r="5" fill="#2b1810" />
              <circle cx="138" cy="167" r="5" fill="#2b1810" />
              <path d="M 94 158 L 109 163" fill="none" stroke="#2b1810" stroke-width="3" stroke-linecap="round" />
              <path d="M 146 158 L 131 163" fill="none" stroke="#2b1810" stroke-width="3" stroke-linecap="round" />
              <ellipse cx="120" cy="177" rx="4.5" ry="3.5" fill="#2b1810" />
            </g>
          {:else if mood === "nag"}
            <g>
              <circle cx="101" cy="166" r="6.8" fill="#2b1810" />
              <circle cx="99" cy="163.5" r="2.8" fill="#ffffff" />
              <circle cx="139" cy="166" r="6.8" fill="#2b1810" />
              <circle cx="137" cy="163.5" r="2.8" fill="#ffffff" />
              <path d="M 113 177 Q 116.5 174 120 177 Q 123.5 180 127 177" fill="none" stroke="#2b1810" stroke-width="2.5" stroke-linecap="round" />
            </g>
          {:else if mood === "celebrate"}
            <g>
              <path d="M 95 167 Q 102 158 109 167" fill="none" stroke="#2b1810" stroke-width="3.2" stroke-linecap="round" />
              <path d="M 131 167 Q 138 158 145 167" fill="none" stroke="#2b1810" stroke-width="3.2" stroke-linecap="round" />
              <path d="M 111 173 Q 120 185 129 173 Z" fill="#2b1810" />
            </g>
          {:else if mood === "poked" || mood === "dragged"}
            <g>
              <circle cx="102" cy="165" r="6" fill="#2b1810" />
              <circle cx="100" cy="163" r="2.4" fill="#ffffff" />
              <circle cx="138" cy="165" r="6" fill="#2b1810" />
              <circle cx="136" cy="163" r="2.4" fill="#ffffff" />
              <circle cx="120" cy="176" r="4.5" fill="#2b1810" />
            </g>
          {:else if mood === "sleeping"}
            <g>
              <path d="M 95 167 Q 102 173 109 167" fill="none" stroke="#2b1810" stroke-width="2.8" stroke-linecap="round" />
              <path d="M 131 167 Q 138 173 145 167" fill="none" stroke="#2b1810" stroke-width="2.8" stroke-linecap="round" />
              <circle cx="120" cy="176" r="2.5" fill="#2b1810" opacity="0.7" />
            </g>
          {/if}
        </g>
      </g>
    </g>
  </g>

  <!-- 4. FX LAYER: Modlara Özel Vektör Efektleri -->
  <g class="fx-layer">
    {#if mood === "focus"}
      <circle class="spore-1" cx="76" cy="96" r="4" fill="#b7e4c7" opacity="0.7" />
      <circle class="spore-2" cx="164" cy="88" r="5" fill="#74c69d" opacity="0.6" />
      <circle class="spore-3" cx="104" cy="52" r="3.5" fill="#d8f3dc" opacity="0.75" />
    {:else if mood === "walking"}
      <path class="water-drop-1" d="M 88 26 C 88 26 83 34 83 37.5 C 83 40.5 85.2 42.5 88 42.5 C 90.8 42.5 93 40.5 93 37.5 C 93 34 88 26 88 26 Z" fill="#38bdf8" opacity="0.85" />
      <path class="water-drop-2" d="M 152 20 C 152 20 147 28 147 31.5 C 147 34.5 149.2 36.5 152 36.5 C 154.8 36.5 157 34.5 157 31.5 C 157 28 152 20 152 20 Z" fill="#7dd3fc" opacity="0.85" />
      <path class="breeze-line" d="M 44 82 Q 70 74 96 82" fill="none" stroke="#a7f3d0" stroke-width="2.2" stroke-linecap="round" opacity="0.5" />
    {:else if mood === "warning"}
      <circle class="warn-ring-1" cx="120" cy="145" r="64" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="10 6" />
      <circle class="warn-ring-2" cx="120" cy="145" r="64" fill="none" stroke="#ef4444" stroke-width="2" />
    {:else if mood === "nag"}
      <path class="nag-wave" d="M 52 96 Q 42 78 56 62" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
      <path class="nag-wave" d="M 188 96 Q 198 78 184 62" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" />
    {:else if mood === "celebrate"}
      <path class="sparkle-1" d="M 62 48 L 65 55 L 72 58 L 65 61 L 62 68 L 59 61 L 52 58 L 59 55 Z" fill="#ffd166" />
      <path class="sparkle-2" d="M 178 44 L 181 51 L 188 54 L 181 57 L 178 64 L 175 57 L 168 54 L 175 51 Z" fill="#ffd166" />
    {:else if mood === "dragged"}
      <circle class="crumb-1" cx="98" cy="204" r="3" fill="#6c4d38" />
      <circle class="crumb-2" cx="142" cy="202" r="2.5" fill="#4a3525" />
    {:else if mood === "sleeping"}
      <circle class="sleep-orb-1" cx="152" cy="86" r="4" fill="#c7d2fe" opacity="0.75" />
      <circle class="sleep-orb-2" cx="88" cy="72" r="3.5" fill="#a7f3d0" opacity="0.75" />
    {/if}
  </g>
</g>

<style>
  .sprout-root { transform-origin: 120px 210px; }
  .pot-assembly { transform-origin: 120px 205px; }
  .stem-assembly { transform-origin: 120px 132px; }
  .leaf-left { transform-origin: 118px 102px; transition: transform 0.3s ease; }
  .leaf-right { transform-origin: 122px 96px; transition: transform 0.3s ease; }
  .top-bud-group { transform-origin: 120px 64px; transition: transform 0.3s ease; }
  .ground-shadow { transform-origin: 120px 212px; }

  .mood-idle .pot-assembly { animation: potBreathe 4s ease-in-out infinite; }
  .mood-idle .stem-assembly { animation: stemSwayIdle 4s ease-in-out infinite; }
  .mood-idle .eye-blink { transform-origin: 120px 168px; animation: blinkEyes 5.5s infinite; }

  .mood-focus .pot-assembly { animation: potBreathe 5s ease-in-out infinite; }
  .mood-focus .spore-1 { animation: floatSporeUp 3.6s ease-in-out infinite; }
  .mood-focus .spore-2 { animation: floatSporeUp 3.6s ease-in-out 1.2s infinite; }
  .mood-focus .spore-3 { animation: floatSporeUp 3.6s ease-in-out 2.4s infinite; }
  .mood-focus.is-fatigued .leaf-left { transform: rotate(-22deg) translateY(6px); }
  .mood-focus.is-fatigued .leaf-right { transform: rotate(22deg) translateY(6px); }

  .mood-focus_sad .leaf-left { transform: rotate(-38deg) translateY(12px); }
  .mood-focus_sad .leaf-right { transform: rotate(38deg) translateY(12px); }

  .mood-walking .stem-assembly { animation: stemSwayIdle 2.2s ease-in-out infinite; }
  .mood-walking .water-drop-1 { animation: rainFall 1.5s linear infinite; }
  .mood-walking .water-drop-2 { animation: rainFall 1.5s linear 0.6s infinite; }

  .mood-warning .warn-ring-1 { transform-origin: 120px 145px; animation: warnRingExpand 1.4s ease-out infinite; }
  .mood-warning .warn-ring-2 { transform-origin: 120px 145px; animation: warnRingExpand 1.4s ease-out 0.7s infinite; }

  .mood-nag .pot-assembly { animation: nagWiggle 1.2s ease-in-out infinite; }
  .mood-celebrate .sprout-body { transform-origin: 120px 210px; animation: celebrateJump 0.75s ease-in-out infinite; }
  .mood-poked .sprout-body { transform-origin: 120px 210px; animation: pokedBoing 0.65s ease-in-out infinite; }
  .mood-dragged .sprout-body { transform-origin: 120px 120px; animation: draggedSwing 1.1s ease-in-out infinite alternate; }
  .mood-sleeping .pot-assembly { animation: potBreathe 5.5s ease-in-out infinite; }
  .mood-sleeping .leaf-left { transform: rotate(34deg) translate(6px, -6px); }
  .mood-sleeping .leaf-right { transform: rotate(-34deg) translate(-6px, -6px); }

  .reduced-motion, .reduced-motion * {
    animation: none !important;
    transition: none !important;
  }

  @keyframes potBreathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.015, 0.988); } }
  @keyframes stemSwayIdle { 0%, 100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
  @keyframes blinkEyes { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.08); } }
  @keyframes floatSporeUp { 0% { transform: translateY(12px); opacity: 0; } 40% { opacity: 0.75; } 100% { transform: translateY(-34px); opacity: 0; } }
  @keyframes rainFall { 0% { transform: translateY(-16px); opacity: 0; } 40% { opacity: 0.85; } 100% { transform: translateY(46px); opacity: 0; } }
  @keyframes warnRingExpand { 0% { transform: scale(0.75); opacity: 0.75; } 100% { transform: scale(1.38); opacity: 0; } }
  @keyframes nagWiggle { 0%, 100% { transform: rotate(-3.5deg); } 50% { transform: rotate(3.5deg); } }
  @keyframes celebrateJump { 0%, 100% { transform: translateY(0); } 45% { transform: translateY(-16px); } }
  @keyframes pokedBoing { 0%, 100% { transform: scale(1, 1); } 30% { transform: scale(1.14, 0.86); } 60% { transform: scale(0.92, 1.08); } }
  @keyframes draggedSwing { 0% { transform: translateY(-12px) rotate(-6deg); } 100% { transform: translateY(-15px) rotate(6deg); } }
</style>