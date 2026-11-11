<script lang="ts">
  import type { Mood, Snapshot } from "../../lib/types";

  interface Props {
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
  }

  let { mood, snapshot, reducedMotion }: Props = $props();

  let isBlinking = $state(false);

  $effect(() => {
    if (reducedMotion || (mood !== "idle" && mood !== "focus")) {
      isBlinking = false;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let blinkResetId: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      const nextDelay = 3500 + Math.random() * 2500;
      timeoutId = setTimeout(() => {
        isBlinking = true;
        blinkResetId = setTimeout(() => {
          isBlinking = false;
          scheduleBlink();
        }, 160);
      }, nextDelay);
    };

    scheduleBlink();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkResetId);
    };
  });

  let focusProgress = $derived(
    snapshot && snapshot.total_secs > 0
      ? Math.min(
          1,
          Math.max(0, (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs)
        )
      : 0
  );

  let isExhausted = $derived(
    Boolean(snapshot && snapshot.remaining_secs <= 0 && snapshot.phase === "focus")
  );

  let eyelidDrop = $derived(
    mood === "focus_sad"
      ? 8
      : mood === "focus"
      ? Math.floor(focusProgress * 5)
      : 0
  );

  let outerFlameUrl = $derived(
    mood === "warning"
      ? "url(#ember-outer-rage)"
      : mood === "sleeping"
      ? "url(#ember-outer-sleep)"
      : isExhausted
      ? "url(#ember-outer-dim)"
      : "url(#ember-outer-normal)"
  );

  let innerFlameUrl = $derived(
    mood === "warning"
      ? "url(#ember-inner-rage)"
      : mood === "sleeping"
      ? "url(#ember-inner-sleep)"
      : "url(#ember-inner-normal)"
  );

  let backPlumeColor = $derived(
    mood === "warning"
      ? "#1E40AF"
      : mood === "sleeping"
      ? "#3B1417"
      : "url(#ember-back-plume-grad)"
  );

  let wispColor = $derived(mood === "warning" ? "#7DD3FC" : "#FFB703");
</script>

<g class="ember-root mood-{mood}" class:reduced-motion={reducedMotion} class:exhausted={isExhausted}>
  <defs>
    <linearGradient id="ember-back-plume-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF4D00" />
      <stop offset="55%" stop-color="#C81D25" />
      <stop offset="100%" stop-color="#6B0F1A" />
    </linearGradient>

    <linearGradient id="ember-outer-normal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FF8A00" />
      <stop offset="45%" stop-color="#FF5126" />
      <stop offset="100%" stop-color="#D9232E" />
    </linearGradient>

    <linearGradient id="ember-inner-normal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF3B0" />
      <stop offset="35%" stop-color="#FFD13B" />
      <stop offset="100%" stop-color="#FF8811" />
    </linearGradient>

    <linearGradient id="ember-outer-dim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D95338" />
      <stop offset="55%" stop-color="#9E2A2B" />
      <stop offset="100%" stop-color="#54161B" />
    </linearGradient>

    <linearGradient id="ember-outer-rage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <linearGradient id="ember-inner-rage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F0F9FF" />
      <stop offset="50%" stop-color="#7DD3FC" />
      <stop offset="100%" stop-color="#3B82F6" />
    </linearGradient>

    <linearGradient id="ember-outer-sleep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7F1D1D" />
      <stop offset="60%" stop-color="#451A1C" />
      <stop offset="100%" stop-color="#27171A" />
    </linearGradient>

    <linearGradient id="ember-inner-sleep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#9A3412" />
    </linearGradient>

    <linearGradient id="ember-wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7C4D34" />
      <stop offset="100%" stop-color="#4E2F1E" />
    </linearGradient>
  </defs>

  <g class="ground-shadow">
    <ellipse cx="120" cy="212" rx="54" ry="11" fill="#1E1410" opacity="0.24" />
    {#if mood !== "sleeping"}
      <ellipse
        cx="120"
        cy="210"
        rx="42"
        ry="8"
        fill={mood === "warning" ? "#38bdf8" : "#ff6b1a"}
        opacity={isExhausted ? 0.10 : 0.22}
      />
    {/if}
  </g>

  {#if mood === "walking"}
    <g class="walk-landing-sparks">
      <!-- Sol taraftan çıkan korlar ve kıvılcımlar -->
      <g class="sparks-side-left">
        <path d="M 58 196 C 50 188, 44 192, 48 199 C 52 204, 58 200, 58 196 Z" fill="#FF9E00" stroke="#2A150D" stroke-width="1.6" />
        <circle cx="44" cy="190" r="3.2" fill="#FFD13B" />
        <circle cx="62" cy="204" r="2.2" fill="#FF4D00" />
        <circle cx="34" cy="198" r="2.4" fill="#FF7B00" />
        <circle cx="50" cy="205" r="1.8" fill="#FFF3B0" />
      </g>

      <!-- Sağ taraftan çıkan korlar ve kıvılcımlar -->
      <g class="sparks-side-right">
        <path d="M 182 196 C 190 188, 196 192, 192 199 C 188 204, 182 200, 182 196 Z" fill="#FF9E00" stroke="#2A150D" stroke-width="1.6" />
        <circle cx="196" cy="190" r="3.2" fill="#FFD13B" />
        <circle cx="178" cy="204" r="2.2" fill="#FF4D00" />
        <circle cx="206" cy="198" r="2.4" fill="#FF7B00" />
        <circle cx="190" cy="205" r="1.8" fill="#FFF3B0" />
      </g>
    </g>
  {/if}

  <g class="legs-container">
    <g class="leg-left">
      <g transform="rotate(-14 96 190)">
        <rect x="64" y="180" width="68" height="22" rx="10" fill="url(#ember-wood)" stroke="#2A150D" stroke-width="3.5" />
        <ellipse cx="66" cy="191" rx="5" ry="9" fill="#C89D7C" stroke="#2A150D" stroke-width="2.5" />
        <path d="M 82 186 L 106 186" stroke="#3B2216" stroke-width="2.5" stroke-linecap="round" />
      </g>
    </g>

    <g class="leg-right">
      <g transform="rotate(14 144 190)">
        <rect x="108" y="180" width="68" height="22" rx="10" fill="url(#ember-wood)" stroke="#2A150D" stroke-width="3.5" />
        <ellipse cx="174" cy="191" rx="5" ry="9" fill="#C89D7C" stroke="#2A150D" stroke-width="2.5" />
        <path d="M 130 192 L 154 192" stroke="#3B2216" stroke-width="2.5" stroke-linecap="round" />
      </g>
    </g>
  </g>

  <g class="body-group">
    {#if mood !== "sleeping"}
      <circle
        cx="120"
        cy="128"
        r={mood === "warning" ? 66 : 58}
        fill={mood === "warning" ? "#38bdf8" : "#ff7b00"}
        opacity="0.14"
      />
    {/if}

    {#if mood === "sleeping"}
      <path
        d="M 120 104 C 154 104 170 126 168 154 C 166 176 146 186 120 186 C 94 186 74 176 72 154 C 70 126 86 104 120 104 Z"
        fill={outerFlameUrl}
        stroke="#23120B"
        stroke-width="4"
      />
      <path
        d="M 90 126 Q 108 136 120 124 M 148 132 Q 135 144 152 156"
        fill="none"
        stroke="#FF6B1A"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.65"
      />
      <ellipse cx="120" cy="154" rx="34" ry="22" fill={innerFlameUrl} opacity="0.75" />
    {:else}
      <path
        class="flame-back-plume"
        d="M 120 36 C 142 58, 166 78, 162 106 C 174 96, 182 88, 178 74 C 190 98, 186 138, 174 158 C 162 178, 144 184, 120 184 C 96 184, 78 178, 66 158 C 54 138, 50 98, 62 74 C 58 88, 66 96, 78 106 C 74 78, 98 58, 120 36 Z"
        fill={backPlumeColor}
        opacity="0.88"
      />
      <path
        class="flame-lick-left"
        d="M 72 132 C 54 118, 52 94, 66 72 C 64 92, 72 104, 82 114 Z"
        fill={outerFlameUrl}
        stroke="#2A150D"
        stroke-width="3"
        stroke-linejoin="round"
      />
      <path
        class="flame-lick-right"
        d="M 168 132 C 186 118, 188 94, 174 72 C 176 92, 168 104, 158 114 Z"
        fill={outerFlameUrl}
        stroke="#2A150D"
        stroke-width="3"
        stroke-linejoin="round"
      />

      {#if !isExhausted}
        <g class="focus-wisps">
          <path
            class="wisp-stream-1"
            d="M 78 72 C 83 80 83 86 78 90 C 73 86 73 80 78 72 Z"
            fill={wispColor}
            stroke="#2A150D"
            stroke-width="2.5"
          />
          <path
            class="wisp-stream-2"
            d="M 162 70 C 167 78 167 84 162 88 C 157 84 157 78 162 70 Z"
            fill={wispColor}
            stroke="#2A150D"
            stroke-width="2.5"
          />
          <circle
            class="wisp-stream-3"
            cx="102"
            cy="48"
            r="4.5"
            fill="#FFE066"
            stroke="#2A150D"
            stroke-width="2"
          />
        </g>
      {/if}

      <path
        class="flame-wisp-top"
        d="M 120 28 C 128 40 130 50 120 56 C 110 50 112 40 120 28 Z"
        fill={mood === "warning" ? "#38bdf8" : "#ff9e00"}
        stroke="#2A150D"
        stroke-width="3"
      />
      <path
        class="flame-outer"
        d="M 120 48 C 138 70, 152 86, 154 102 C 162 94, 168 86, 166 78 C 178 98, 178 132, 172 152 C 165 175, 146 184, 120 184 C 94 184, 75 175, 68 152 C 62 132, 62 98, 74 78 C 72 86, 78 94, 86 102 C 88 86, 102 70, 120 48 Z"
        fill={outerFlameUrl}
        stroke="#2A150D"
        stroke-width="4"
        stroke-linejoin="round"
      />
      <path
        class="flame-inner"
        d="M 120 76 C 136 98, 158 118, 154 148 C 152 168, 138 176, 120 176 C 102 176, 88 168, 86 148 C 82 118, 104 98, 120 76 Z"
        fill={innerFlameUrl}
      />
      <ellipse
        class="flame-core-hot"
        cx="120"
        cy="152"
        rx="24"
        ry="18"
        fill="#FFFBEB"
        opacity={isExhausted ? 0.25 : 0.6}
      />
    {/if}

    {#if mood === "focus" || mood === "focus_sad"}
      <g class="focus-bar" transform="translate(82, 172)">
        <rect x="0" y="0" width="76" height="10" rx="5" fill="#2A150D" stroke="#4E2F1E" stroke-width="2" />
        <rect
          x="2"
          y="2"
          width={Math.max(4, 72 * focusProgress)}
          height="6"
          rx="3"
          fill={isExhausted ? "#ef4444" : "#ffb703"}
        />
      </g>
    {/if}

    <g class="face-group" transform={mood === "sleeping" ? "translate(0, 14)" : "translate(0, 0)"}>
      {#if mood !== "warning"}
        <ellipse
          cx="91"
          cy="142"
          rx={mood === "nag" ? 8 : 6}
          ry="3.5"
          fill={mood === "nag" ? "#f43f5e" : "#ff5a36"}
          opacity={mood === "nag" ? 0.75 : 0.45}
        />
        <ellipse
          cx="149"
          cy="142"
          rx={mood === "nag" ? 8 : 6}
          ry="3.5"
          fill={mood === "nag" ? "#f43f5e" : "#ff5a36"}
          opacity={mood === "nag" ? 0.75 : 0.45}
        />
      {/if}

      {#if mood === "sleeping"}
        <path d="M 94 134 Q 102 140 110 134" fill="none" stroke="#2A150D" stroke-width="4" stroke-linecap="round" />
        <path d="M 130 134 Q 138 140 146 134" fill="none" stroke="#2A150D" stroke-width="4" stroke-linecap="round" />
      {:else if mood === "poked"}
        <path d="M 93 126 L 107 133 L 93 140" fill="none" stroke="#2A150D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 147 126 L 133 133 L 147 140" fill="none" stroke="#2A150D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      {:else if mood === "celebrate"}
        <path d="M 92 136 Q 101 122 110 136" fill="none" stroke="#2A150D" stroke-width="4.2" stroke-linecap="round" />
        <path d="M 130 136 Q 139 122 148 136" fill="none" stroke="#2A150D" stroke-width="4.2" stroke-linecap="round" />
      {:else if isBlinking}
        <line x1="93" y1="133" x2="109" y2="133" stroke="#2A150D" stroke-width="4" stroke-linecap="round" />
        <line x1="131" y1="133" x2="147" y2="133" stroke="#2A150D" stroke-width="4" stroke-linecap="round" />
      {:else}
        <g class="eye-left">
          <circle
            cx="101"
            cy="132"
            r={mood === "nag" ? 9.5 : mood === "dragged" ? 9 : 8}
            fill="#23120B"
          />
          <circle
            cx="98"
            cy="129"
            r={mood === "nag" ? 3.8 : 2.8}
            fill="#FFFFFF"
          />
          {#if mood === "nag" || mood === "idle"}
            <circle cx="104" cy="135" r="1.6" fill="#FFFFFF" />
          {/if}
          {#if eyelidDrop > 0}
            <path
              d="M 90 122 H 112 V {122 + eyelidDrop} H 90 Z"
              fill={mood === "focus_sad" ? "#9E2A2B" : "#FF8811"}
            />
            <line
              x1="91"
              y1={122 + eyelidDrop}
              x2="111"
              y2={122 + eyelidDrop}
              stroke="#23120B"
              stroke-width="3"
              stroke-linecap="round"
            />
          {/if}
        </g>

        <g class="eye-right">
          <circle
            cx="139"
            cy="132"
            r={mood === "nag" ? 9.5 : mood === "dragged" ? 9 : 8}
            fill="#23120B"
          />
          <circle
            cx="136"
            cy="129"
            r={mood === "nag" ? 3.8 : 2.8}
            fill="#FFFFFF"
          />
          {#if mood === "nag" || mood === "idle"}
            <circle cx="142" cy="135" r="1.6" fill="#FFFFFF" />
          {/if}
          {#if eyelidDrop > 0}
            <path
              d="M 128 122 H 150 V {122 + eyelidDrop} H 128 Z"
              fill={mood === "focus_sad" ? "#9E2A2B" : "#FF8811"}
            />
            <line
              x1="129"
              y1={122 + eyelidDrop}
              x2="149"
              y2={122 + eyelidDrop}
              stroke="#23120B"
              stroke-width="3"
              stroke-linecap="round"
            />
          {/if}
        </g>

        {#if mood === "focus_sad"}
          <circle cx="92" cy="139" r="3.5" fill="#38BDF8" />
          <circle cx="148" cy="139" r="3.5" fill="#38BDF8" />
        {/if}

        {#if mood === "warning"}
          <line x1="90" y1="118" x2="110" y2="125" stroke="#1E1B4B" stroke-width="4.5" stroke-linecap="round" />
          <line x1="150" y1="118" x2="130" y2="125" stroke="#1E1B4B" stroke-width="4.5" stroke-linecap="round" />
        {/if}

        {#if mood === "nag" || mood === "focus_sad"}
          <line x1="90" y1="122" x2="108" y2="117" stroke="#23120B" stroke-width="3.2" stroke-linecap="round" />
          <line x1="150" y1="122" x2="132" y2="117" stroke="#23120B" stroke-width="3.2" stroke-linecap="round" />
        {/if}
      {/if}

      {#if mood === "dragged"}
        <circle cx="120" cy="146" r="5.5" fill="#23120B" />
        <circle cx="120" cy="147" r="2.5" fill="#FF5A36" />
      {:else if mood === "celebrate"}
        <path d="M 108 142 Q 120 158 132 142 Z" fill="#7F1D1D" stroke="#23120B" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 113 148 Q 120 153 127 148" fill="#FF6B6B" />
      {:else if mood === "nag" || mood === "focus_sad"}
        <path d="M 111 149 Q 120 141 129 149" fill="none" stroke="#23120B" stroke-width="3.5" stroke-linecap="round" />
      {:else if mood === "warning"}
        <path d="M 110 148 Q 120 142 130 148" fill="none" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" />
      {:else if mood === "sleeping"}
        <circle cx="120" cy="144" r="2.5" fill="#23120B" />
      {:else if mood === "walking"}
        <path d="M 110 142 Q 120 152 130 142" fill="none" stroke="#23120B" stroke-width="3.8" stroke-linecap="round" />
      {:else}
        <path d="M 112 143 Q 120 150 128 143" fill="none" stroke="#23120B" stroke-width="3.8" stroke-linecap="round" />
      {/if}
    </g>
  </g>

  <g class="fx-group">
    {#if mood === "celebrate"}
      <g class="sparks-celebrate">
        <!-- Tam tepe merkezde parlayan zafer kıvılcımları ve közler -->
        <path d="M 120 -18 L 123 -9 L 132 -6 L 123 -3 L 120 6 L 117 -3 L 108 -6 L 117 -9 Z" fill="#FFF3B0" stroke="#2A150D" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M 96 -4 L 98 1 L 104 3 L 98 5 L 96 10 L 94 5 L 88 3 L 94 1 Z" fill="#FFD13B" stroke="#2A150D" stroke-width="1.6" stroke-linejoin="round" />
        <path d="M 144 -4 L 146 1 L 152 3 L 146 5 L 144 10 L 142 5 L 136 3 L 142 1 Z" fill="#FFD13B" stroke="#2A150D" stroke-width="1.6" stroke-linejoin="round" />

        <!-- Yukarı Fırlayan Alev Damlaları / Közler -->
        <path d="M 106 -12 C 100 -20, 93 -16, 97 -8 C 100 -3, 107 -6, 106 -12 Z" fill="#FF7B00" stroke="#2A150D" stroke-width="1.6" />
        <path d="M 134 -12 C 140 -20, 147 -16, 143 -8 C 140 -3, 133 -6, 134 -12 Z" fill="#FF4D00" stroke="#2A150D" stroke-width="1.6" />
        <path d="M 114 -26 C 117 -34, 123 -34, 126 -26 C 124 -21, 117 -21, 114 -26 Z" fill="#FFD13B" stroke="#2A150D" stroke-width="1.5" />

        <!-- Karakterin Tam Üstünde Saçılan Kıvılcım ve Kor Parçacıkları -->
        <circle cx="120" cy="-32" r="2.8" fill="#FFFBEB" />
        <circle cx="84" cy="-2" r="3.2" fill="#FFB703" />
        <circle cx="156" cy="-2" r="3.2" fill="#FFB703" />
        <circle cx="108" cy="8" r="2.5" fill="#FF5126" />
        <circle cx="132" cy="8" r="2.5" fill="#FF7B00" />
        <circle cx="74" cy="8" r="2.2" fill="#FF4D00" />
        <circle cx="166" cy="8" r="2.2" fill="#FF4D00" />
        <circle cx="120" cy="-8" r="3.4" fill="#FFD13B" />
      </g>
    {/if}

    {#if mood === "sleeping"}
      <g class="sleep-fx">
        <circle cx="136" cy="84" r="6" fill="#9CA3AF" opacity="0.35" />
        <circle cx="148" cy="64" r="9" fill="#9CA3AF" opacity="0.25" />
        <text x="134" y="92" font-family="monospace" font-weight="bold" font-size="16" fill="#FDE68A">Z</text>
        <text x="150" y="70" font-family="monospace" font-weight="bold" font-size="20" fill="#FDE68A">z</text>
        <text x="166" y="48" font-family="monospace" font-weight="bold" font-size="14" fill="#FDE68A">z</text>
      </g>
    {/if}

    {#if mood === "warning"}
      <g class="warning-fx" transform="translate(120, 26)">
        <polygon points="0,-20 18,12 -18,12" fill="#FACC15" stroke="#1E1B4B" stroke-width="3.5" stroke-linejoin="round" />
        <line x1="0" y1="-10" x2="0" y2="0" stroke="#1E1B4B" stroke-width="4" stroke-linecap="round" />
        <circle cx="0" cy="6" r="2.2" fill="#1E1B4B" />
      </g>
    {/if}
  </g>
</g>

<style>
  /* ==========================================================================
     EMBER KARAKTER CSS ANİMASYONLARI (Çok Katmanlı Alev & Doğal Ocak Sistemi)
     ========================================================================== */
  .body-group {
    transform-origin: 120px 180px;
  }
  .legs-container {
    transform-origin: 120px 192px;
  }
  .ground-shadow {
    transform-origin: 120px 212px;
  }
  .flame-back-plume {
    transform-origin: 120px 180px;
  }
  .flame-outer {
    transform-origin: 120px 180px;
  }
  .flame-inner {
    transform-origin: 120px 176px;
  }
  .flame-core-hot {
    transform-origin: 120px 152px;
  }
  .flame-lick-left {
    transform-origin: 82px 114px;
  }
  .flame-lick-right {
    transform-origin: 158px 114px;
  }
  .flame-wisp-top {
    transform-origin: 120px 56px;
  }
  .face-group {
    transform-origin: 120px 136px;
  }

  /* ==========================================================================
     1. TEMEL DUYGU VE NEFES ANİMASYONLARI (IDLE, FOCUS, TIRED, SLEEPING)
     ========================================================================== */

  /* Idle Modu */
  .mood-idle .body-group {
    animation: ember-breathe 2.4s ease-in-out infinite;
  }
  .mood-idle .flame-back-plume {
    animation: plume-sway-back 3.2s ease-in-out infinite;
  }
  .mood-idle .flame-outer {
    animation: plume-wave-outer 2.2s ease-in-out infinite;
  }
  .mood-idle .flame-inner {
    animation: plume-counter-inner 1.8s ease-in-out infinite;
  }
  .mood-idle .flame-core-hot {
    animation: core-pulse 1.6s ease-in-out infinite;
  }
  .mood-idle .flame-lick-left {
    animation: lick-curl-left 2.6s ease-in-out infinite;
  }
  .mood-idle .flame-lick-right {
    animation: lick-curl-right 2.9s ease-in-out infinite;
  }
  .mood-idle .flame-wisp-top {
    animation: wisp-dance 1.4s ease-in-out infinite alternate;
  }

  /* Focus Modu (Kademeli ve Akıcı Çalışma) */
  .mood-focus .body-group,
  .mood-focus_sad .body-group {
    animation: ember-focus-surge 3.4s ease-in-out infinite;
  }
  .mood-focus .flame-back-plume {
    animation: plume-sway-back-focus 2.8s ease-in-out infinite;
  }
  .mood-focus .flame-outer {
    animation: plume-wave-outer-focus 1.9s ease-in-out infinite;
  }
  .mood-focus .flame-inner {
    animation: plume-counter-inner-focus 1.5s ease-in-out infinite;
  }
  .mood-focus .flame-core-hot {
    animation: core-pulse 1.2s ease-in-out infinite;
  }
  .mood-focus .wisp-stream-1 {
    animation: stream-rise-left 1.4s ease-in-out infinite;
  }
  .mood-focus .wisp-stream-2 {
    animation: stream-rise-right 1.7s ease-in-out infinite;
  }
  .mood-focus .wisp-stream-3 {
    animation: stream-rise-center 1.1s ease-in-out infinite;
  }

  /* Exhausted / Focus Sad (Yorgun Ateş) */
  .exhausted .body-group,
  .mood-focus_sad .body-group {
    animation: ember-tired 3.0s steps(4, end) infinite;
  }
  .exhausted .flame-back-plume,
  .exhausted .flame-outer,
  .exhausted .flame-inner {
    animation-duration: 2.6s !important;
  }

  /* Sleeping Modu (Köz Nefesi) */
  .mood-sleeping .body-group {
    animation: sleep-breathe 3.6s steps(4, end) infinite;
  }
  .mood-sleeping .sleep-fx {
    animation: smoke-rise 3s steps(4, end) infinite;
  }

  /* ==========================================================================
     2. HAREKET VE ETKİLEŞİM MODLARI (WALKING, CELEBRATE, DRAGGED, POKED, VB.)
     ========================================================================== */

  /* WALKING: Olduğu Yerde Zıplama + İki Tarafa Eşit Saçılan Köz ve Kıvılcımlar */
  .mood-walking .body-group {
    animation: slime-hop-body 0.72s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
  }
  .mood-walking .legs-container {
    animation: slime-hop-logs 0.72s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
  }
  .mood-walking .ground-shadow {
    animation: slime-hop-shadow 0.72s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
  }
  .mood-walking .sparks-side-left {
    transform-origin: 64px 202px;
    animation: landing-sparks-burst-left 0.72s cubic-bezier(0.16, 0.88, 0.35, 1) infinite;
  }
  .mood-walking .sparks-side-right {
    transform-origin: 176px 202px;
    animation: landing-sparks-burst-right 0.72s cubic-bezier(0.16, 0.88, 0.35, 1) infinite;
  }
  .mood-walking .flame-outer {
    animation: plume-wave-outer-focus 1.1s steps(6, end) infinite;
  }

  /* CELEBRATE: Odunlar Yerde Sabit, Alev Roket Gibi Fırlar ve Karakterin Tam Üstünde Közler Saçılır */
  .mood-celebrate .body-group {
    animation: firework-launch-body 0.9s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  }
  .mood-celebrate .legs-container {
    animation: firework-recoil-logs 0.9s ease-out infinite;
  }
  .mood-celebrate .ground-shadow {
    animation: firework-shadow-pulse 0.9s ease-in-out infinite;
  }
  .mood-celebrate .sparks-celebrate {
    transform-origin: 120px 0px;
    animation: firework-sparks-burst 0.9s cubic-bezier(0.18, 0.9, 0.35, 1) infinite;
  }

  /* DRAGGED: Alev Yukarı Doğru Uzar, Odunlar Çekim Gücüne Kapılıp Altında Sallanır */
  .mood-dragged .body-group {
    animation: dragged-flame-stretch 0.65s ease-in-out infinite alternate;
  }
  .mood-dragged .legs-container {
    animation: dragged-logs-pendulum 0.55s ease-in-out infinite alternate;
  }
  .mood-dragged .leg-left {
    animation: dragged-log-left-dangle 0.45s ease-in-out infinite alternate;
  }
  .mood-dragged .leg-right {
    animation: dragged-log-right-dangle 0.45s ease-in-out infinite alternate-reverse;
  }
  .mood-dragged .ground-shadow {
    transform: scale(0.65);
    opacity: 0.45;
  }

  /* Poked (Tek Tıklama Harlama Tepkisi) */
  .mood-poked .body-group {
    animation: poke-flare 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
  }

  /* Warning (Mola İhlali: Yüksek Isı Harlaması) */
  .mood-warning .body-group {
    animation: warning-shake 0.35s ease-in-out infinite alternate;
  }
  .mood-warning .flame-back-plume,
  .mood-warning .flame-outer {
    animation: plume-wave-outer-focus 0.65s steps(6, end) infinite;
  }

  /* Nag (Mola Atlandığında Yalvarma) */
  .mood-nag .body-group {
    animation: nag-sway 1.2s ease-in-out infinite alternate;
  }

  /* ==========================================================================
     KEYFRAMES — ALEV HÜZMESİ VE YENİ FİZİK ANİMASYONLARI
     ========================================================================== */
  @keyframes ember-breathe {
    0%, 100% { transform: scale(1, 1) translateY(0px); }
    50% { transform: scale(1.02, 0.98) translateY(-3px); }
  }

  @keyframes ember-focus-surge {
    0%, 100% { transform: translateY(0px) scale(1, 1); }
    33% { transform: translateY(-3px) scale(0.99, 1.03); }
    66% { transform: translateY(-1px) scale(1.02, 0.99); }
  }

  @keyframes plume-sway-back {
    0%, 100% { transform: skewX(-4deg) scale(1, 1); }
    50% { transform: skewX(5deg) scale(0.96, 1.07) translateY(-3px); }
  }
  @keyframes plume-sway-back-focus {
    0%   { transform: skewX(-7deg) scale(0.96, 1.06) translateY(-2px); }
    25%  { transform: skewX(2deg)  scale(1.03, 0.97) translateY(1px); }
    50%  { transform: skewX(8deg)  scale(0.94, 1.11) translateY(-5px); }
    75%  { transform: skewX(-2deg) scale(1.04, 0.98) translateY(0px); }
    100% { transform: skewX(-7deg) scale(0.96, 1.06) translateY(-2px); }
  }

  @keyframes plume-wave-outer {
    0%, 100% { transform: skewX(3deg) scale(1, 1); }
    50% { transform: skewX(-4deg) scale(1.03, 0.97) translateY(-2px); }
  }
  @keyframes plume-wave-outer-focus {
    0%   { transform: skewX(5deg)  scale(1.02, 0.97); }
    25%  { transform: skewX(-6deg) scale(0.96, 1.07) translateY(-4px); }
    50%  { transform: skewX(-2deg) scale(1.04, 0.96) translateY(1px); }
    75%  { transform: skewX(6deg)  scale(0.95, 1.08) translateY(-5px); }
    100% { transform: skewX(5deg)  scale(1.02, 0.97); }
  }

  @keyframes plume-counter-inner {
    0%, 100% { transform: skewX(-3deg) scale(0.98, 1.03); }
    50% { transform: skewX(4deg) scale(1.04, 0.96) translateY(-2px); }
  }
  @keyframes plume-counter-inner-focus {
    0%   { transform: skewX(-6deg) translateX(-2px) scale(0.95, 1.08); }
    33%  { transform: skewX(6deg)  translateX(2px)  scale(1.06, 0.94) translateY(-3px); }
    66%  { transform: skewX(-3deg) translateX(-1px) scale(0.97, 1.06) translateY(-5px); }
    100% { transform: skewX(-6deg) translateX(-2px) scale(0.95, 1.08); }
  }

  @keyframes core-pulse {
    0%, 100% { transform: scale(1, 1); opacity: 0.65; }
    50% { transform: scale(1.16, 1.24) translateY(-3px); opacity: 0.9; }
  }

  @keyframes lick-curl-left {
    0%, 100% { transform: rotate(0deg) translateY(0px) scale(1); }
    50% { transform: rotate(-14deg) translateY(-8px) scale(0.88, 1.18); }
  }
  @keyframes lick-curl-right {
    0%, 100% { transform: rotate(-10deg) translateY(-6px) scale(0.9, 1.15); }
    50% { transform: rotate(6deg) translateY(1px) scale(1.05, 0.92); }
  }

  @keyframes wisp-dance {
    0%   { transform: translateY(4px) translateX(0px) scale(1.1); opacity: 0.95; }
    50%  { transform: translateY(-7px) translateX(-3px) scale(0.85, 1.15); opacity: 1; }
    100% { transform: translateY(-16px) translateX(3px) scale(0.45); opacity: 0.15; }
  }

  @keyframes stream-rise-left {
    0%   { transform: translate(0px, 6px) scale(0.95); opacity: 0.9; }
    50%  { transform: translate(-8px, -14px) scale(1.1, 1.2) rotate(-12deg); opacity: 0.85; }
    100% { transform: translate(-3px, -34px) scale(0.35); opacity: 0; }
  }

  @keyframes stream-rise-right {
    0%   { transform: translate(0px, 8px) scale(0.9); opacity: 0.9; }
    50%  { transform: translate(9px, -12px) scale(1.1, 1.2) rotate(14deg); opacity: 0.85; }
    100% { transform: translate(4px, -32px) scale(0.35); opacity: 0; }
  }

  @keyframes stream-rise-center {
    0%   { transform: translate(0px, 4px) scale(1); opacity: 0.95; }
    50%  { transform: translate(4px, -12px) scale(0.8, 1.2); opacity: 0.8; }
    100% { transform: translate(-4px, -28px) scale(0.3); opacity: 0; }
  }

  @keyframes ember-tired {
    0%, 100% { transform: scale(0.95, 0.90) translateY(6px); }
    50% { transform: scale(0.97, 0.87) translateY(9px); }
  }

  @keyframes sleep-breathe {
    0%, 100% { transform: scale(1, 0.96); }
    50% { transform: scale(1.04, 1); }
  }

  @keyframes smoke-rise {
    0% { transform: translateY(4px); opacity: 0.4; }
    100% { transform: translateY(-8px); opacity: 0.95; }
  }

  /* WALKING: Olduğu Yerde Slime Zıplaması ve İki Tarafa Eşit Saçılan Közler */
  @keyframes slime-hop-body {
    0%, 100% {
      transform: translateY(6px) scale(1.16, 0.84);
    }
    20% {
      transform: translateY(-4px) scale(0.90, 1.14);
    }
    50% {
      transform: translateY(-22px) scale(0.96, 1.05);
    }
    78% {
      transform: translateY(-2px) scale(1.06, 0.95);
    }
  }

  @keyframes slime-hop-logs {
    0%, 100% {
      transform: translateY(3px) scale(1.08, 0.92);
    }
    50% {
      transform: translateY(-10px) scale(0.98, 1.02);
    }
    78% {
      transform: translateY(0px) scale(1.02, 0.98);
    }
  }

  @keyframes slime-hop-shadow {
    0%, 100% {
      transform: scale(1.15, 1.1);
      opacity: 0.9;
    }
    50% {
      transform: scale(0.72);
      opacity: 0.45;
    }
  }

  @keyframes landing-sparks-burst-left {
    0% {
      opacity: 0;
      transform: translate(6px, 2px) scale(0.2);
    }
    8% {
      opacity: 1;
      transform: translate(0px, 0px) scale(0.9);
    }
    26% {
      opacity: 0.95;
      transform: translate(-14px, -11px) scale(1.25);
    }
    44% {
      opacity: 0;
      transform: translate(-22px, -16px) scale(0.5);
    }
    100% {
      opacity: 0;
      transform: translate(0px, 0px) scale(0.2);
    }
  }

  @keyframes landing-sparks-burst-right {
    0% {
      opacity: 0;
      transform: translate(-6px, 2px) scale(0.2);
    }
    8% {
      opacity: 1;
      transform: translate(0px, 0px) scale(0.9);
    }
    26% {
      opacity: 0.95;
      transform: translate(14px, -11px) scale(1.25);
    }
    44% {
      opacity: 0;
      transform: translate(22px, -16px) scale(0.5);
    }
    100% {
      opacity: 0;
      transform: translate(0px, 0px) scale(0.2);
    }
  }

  /* CELEBRATE: Odunlardan Roket/Havai Fişek Gibi Fırlama (Squash & Stretch) */
  @keyframes firework-launch-body {
    0%, 100% {
      transform: translateY(5px) scale(1.18, 0.82);
    }
    15% {
      transform: translateY(-6px) scale(0.84, 1.22);
    }
    45% {
      transform: translateY(-28px) scale(1.08, 1.12);
    }
    62% {
      transform: translateY(-24px) scale(1.14, 1.06);
    }
    85% {
      transform: translateY(-2px) scale(0.94, 1.06);
    }
  }

  @keyframes firework-recoil-logs {
    0%, 100% {
      transform: translateY(3px) scale(1.06, 0.93);
    }
    20% {
      transform: translateY(4px) scale(1.08, 0.90);
    }
    50%, 80% {
      transform: translateY(0px) scale(1, 1);
    }
  }

  @keyframes firework-shadow-pulse {
    0%, 100% {
      transform: scaleX(1.1);
      opacity: 1;
    }
    50% {
      transform: scaleX(0.75);
      opacity: 0.6;
    }
  }

  @keyframes firework-sparks-burst {
    0%, 20% {
      opacity: 0;
      transform: translateY(30px) scale(0.2);
    }
    42% {
      opacity: 1;
      transform: translateY(-4px) scale(0.95);
    }
    60%, 72% {
      opacity: 0.95;
      transform: translateY(-22px) scale(1.25);
    }
    92%, 100% {
      opacity: 0;
      transform: translateY(-34px) scale(1.4);
    }
  }

  /* DRAGGED: Yukarı Uzayan Alev ve Çekim Gücüyle Sallanan Odunlar */
  @keyframes dragged-flame-stretch {
    0% {
      transform: translateY(-10px) scale(0.88, 1.16) rotate(-3deg);
    }
    100% {
      transform: translateY(-14px) scale(0.85, 1.20) rotate(3deg);
    }
  }

  @keyframes dragged-logs-pendulum {
    0% {
      transform: translateY(6px) translateX(-4px) rotate(-6deg);
    }
    100% {
      transform: translateY(9px) translateX(4px) rotate(6deg);
    }
  }

  @keyframes dragged-log-left-dangle {
    0% { transform: rotate(-4deg) translateY(0px); }
    100% { transform: rotate(5deg) translateY(3px); }
  }

  @keyframes dragged-log-right-dangle {
    0% { transform: rotate(4deg) translateY(0px); }
    100% { transform: rotate(-5deg) translateY(3px); }
  }

  @keyframes poke-flare {
    0% { transform: scale(1, 1); }
    40% { transform: scale(1.16, 0.86); }
    75% { transform: scale(0.92, 1.12) translateY(-8px); }
    100% { transform: scale(1, 1); }
  }

  @keyframes warning-shake {
    from { transform: translateX(-3px) scale(1.05); }
    to { transform: translateX(3px) scale(1.08); }
  }

  @keyframes nag-sway {
    from { transform: rotate(-4deg) translateY(3px); }
    to { transform: rotate(4deg) translateY(3px); }
  }

  /* Erişilebilirlik & Performans: Reduced Motion */
  .reduced-motion,
  .reduced-motion * {
    animation: none !important;
    transition: none !important;
  }
</style>
