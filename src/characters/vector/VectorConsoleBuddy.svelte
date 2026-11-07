<script lang="ts">
  import type { Mood, Snapshot } from "../../lib/types";
  import { mintVectorTheme, type VectorConsoleTheme } from "./theme";

  interface Props {
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
    theme?: VectorConsoleTheme;
  }

  let {
    mood,
    snapshot,
    reducedMotion,
    theme = mintVectorTheme,
  }: Props = $props();

  let blinking = $state(false);
  let pageHidden = $state(false);

  const canBlink = $derived(
    mood === "idle" || mood === "focus" || mood === "focus_sad",
  );

  // Visibility check so timers pause when hidden
  $effect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      pageHidden = document.hidden;
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  });

  // Natural periodic blink every 3.5-6s in calm moods
  $effect(() => {
    blinking = false;
    if (reducedMotion || pageHidden || !canBlink) return;

    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;

    function schedule() {
      const wait = 3500 + Math.floor(Math.random() * 2500);
      t1 = setTimeout(() => {
        blinking = true;
        t2 = setTimeout(() => {
          blinking = false;
          schedule();
        }, 150);
      }, wait);
    }

    schedule();
    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  });

  // Focus progress (0..1)
  const focusProgress = $derived.by(() => {
    if (snapshot.total_secs <= 0) return 0;
    return Math.max(
      0,
      Math.min(
        1,
        (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs,
      ),
    );
  });

  // Near-break fatigue activates in the final 20% of Focus (last 5 mins of 25m) or in focus_sad / nag
  const isNearBreak = $derived(
    (mood === "focus" && focusProgress >= 0.8) ||
      mood === "focus_sad" ||
      mood === "nag",
  );

  // Smooth eyelid droop (0..10 px) as focus approaches break
  const eyelidHeight = $derived.by(() => {
    if (blinking) return 20;
    if (mood === "focus_sad") return 9;
    if (mood === "nag") return 6;
    if (mood === "focus" && focusProgress >= 0.75) {
      const ratio = (focusProgress - 0.75) / 0.25;
      return Math.min(10, Math.round(ratio * 10));
    }
    return 0;
  });

  const showLowBattery = $derived(isNearBreak);
  const showSweatDrop = $derived(isNearBreak);
  const showScreenProgress = $derived(
    mood === "focus" || mood === "focus_sad",
  );
  const progressBarWidth = $derived(Math.max(4, Math.round(focusProgress * 56)));
</script>

<g
  class="vector-console-root mood-{mood}"
  class:near-break={isNearBreak}
  class:reduced-motion={reducedMotion || pageHidden}
>
  <defs>
    <linearGradient
      id="vc-body-{theme.id}"
      x1="62"
      y1="34"
      x2="178"
      y2="176"
      gradientUnits="userSpaceOnUse"
    >
      <stop offset="0%" stop-color={theme.bodyTop} />
      <stop offset="55%" stop-color={theme.bodyMid} />
      <stop offset="100%" stop-color={theme.bodyBottom} />
    </linearGradient>

    <linearGradient
      id="vc-screen-{theme.id}"
      x1="80"
      y1="52"
      x2="160"
      y2="108"
      gradientUnits="userSpaceOnUse"
    >
      <stop
        offset="0%"
        stop-color={mood === "sleeping" ? theme.screenSleepTop : theme.screenTop}
      />
      <stop
        offset="100%"
        stop-color={mood === "sleeping"
          ? theme.screenSleepBottom
          : theme.screenBottom}
      />
    </linearGradient>

    <linearGradient id="vc-limb-{theme.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color={theme.limbStart} />
      <stop offset="100%" stop-color={theme.limbEnd} />
    </linearGradient>
  </defs>

  <!-- 1. Ground Shadow -->
  <ellipse
    class="ground-shadow"
    cx="120"
    cy="214"
    rx="44"
    ry="8"
    fill="#091518"
    opacity="0.38"
  />

  <!-- 2. Whole Rigged Character -->
  <g class="whole-rig">
    <!-- Left Leg -->
    <g class="left-leg">
      <rect
        x="93"
        y="170"
        width="13"
        height="29"
        rx="6.5"
        fill="url(#vc-limb-{theme.id})"
        stroke={theme.bodyStroke}
        stroke-width="3"
      />
      <path
        d="M85 194 C85 188, 111 188, 111 196 L111 203 C111 205, 83 205, 83 199 Z"
        fill={theme.shoeFill}
        stroke={theme.bodyStroke}
        stroke-width="3"
      />
      <line
        x1="85"
        y1="201.5"
        x2="109"
        y2="201.5"
        stroke={theme.shoeSole}
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </g>

    <!-- Right Leg -->
    <g class="right-leg">
      <rect
        x="134"
        y="170"
        width="13"
        height="29"
        rx="6.5"
        fill="url(#vc-limb-{theme.id})"
        stroke={theme.bodyStroke}
        stroke-width="3"
      />
      <path
        d="M129 194 C129 188, 155 188, 155 196 L157 199 C157 205, 129 205, 129 203 Z"
        fill={theme.shoeFill}
        stroke={theme.bodyStroke}
        stroke-width="3"
      />
      <line
        x1="131"
        y1="201.5"
        x2="155"
        y2="201.5"
        stroke={theme.shoeSole}
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </g>

    <!-- Console Upper Body & Arms -->
    <g class="upper-body">
      <!-- Left Arm -->
      <g class="left-arm">
        <rect
          x="46"
          y="112"
          width="13"
          height="38"
          rx="6.5"
          fill="url(#vc-limb-{theme.id})"
          stroke={theme.bodyStroke}
          stroke-width="3"
        />
        <circle
          cx="52.5"
          cy="150"
          r="6.5"
          fill={theme.handFill}
          stroke={theme.bodyStroke}
          stroke-width="3"
        />
      </g>

      <!-- Right Arm -->
      <g class="right-arm">
        <rect
          x="181"
          y="112"
          width="13"
          height="38"
          rx="6.5"
          fill="url(#vc-limb-{theme.id})"
          stroke={theme.bodyStroke}
          stroke-width="3"
        />
        <circle
          cx="187.5"
          cy="150"
          r="6.5"
          fill={theme.handFill}
          stroke={theme.bodyStroke}
          stroke-width="3"
        />
      </g>

      <!-- Handheld Game Console Shell -->
      <g class="console-shell">
        <!-- Top Cartridge Lip -->
        <rect
          x="92"
          y="29"
          width="56"
          height="9"
          rx="4"
          fill={theme.bodyBottom}
          stroke={theme.bodyStroke}
          stroke-width="3"
        />

        <!-- Side Volume Dial -->
        <rect
          x="57"
          y="74"
          width="6"
          height="20"
          rx="3"
          fill={theme.dpadFill}
          stroke={theme.bodyStroke}
          stroke-width="2.5"
        />

        <!-- Main Rounded Handheld Body -->
        <rect
          x="61"
          y="35"
          width="118"
          height="142"
          rx="22"
          fill="url(#vc-body-{theme.id})"
          stroke={theme.bodyStroke}
          stroke-width="3.5"
        />

        <!-- Inner Highlight Arc -->
        <path
          d="M74 41 L166 41"
          stroke="rgba(255, 255, 255, 0.45)"
          stroke-width="3"
          stroke-linecap="round"
        />

        <!-- Recessed Screen Bezel -->
        <rect
          x="72"
          y="46"
          width="96"
          height="68"
          rx="14"
          fill={theme.bezelFill}
          stroke={theme.bodyStroke}
          stroke-width="2.5"
        />

        <!-- Power Indicator LED on Bezel -->
        <circle
          class="power-led"
          cx="77.5"
          cy="78"
          r="2.4"
          fill={showLowBattery ? "#f43f5e" : "#34d399"}
        />

        <!-- Inner LCD / Mint Screen -->
        <rect
          x="82"
          y="52"
          width="80"
          height="56"
          rx="10"
          fill="url(#vc-screen-{theme.id})"
          stroke={theme.bodyStroke}
          stroke-width="2"
        />

        <!-- Screen Glass Glint -->
        <path
          d="M89 57 C98 55.5, 114 55.5, 123 57"
          stroke="rgba(255, 255, 255, 0.55)"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- ================= SCREEN FACE & EXPRESSIONS ================= -->
        <g class="face-layer">
          <!-- Blush Cheeks -->
          {#if mood !== "sleeping" && mood !== "warning"}
            <ellipse
              cx="93"
              cy="87"
              rx="5"
              ry="2.8"
              fill={theme.cheekColor}
              opacity="0.65"
            />
            <ellipse
              cx="151"
              cy="87"
              rx="5"
              ry="2.8"
              fill={theme.cheekColor}
              opacity="0.65"
            />
          {/if}

          {#if mood === "sleeping"}
            <path
              d="M96 78 Q103 83 110 78"
              stroke={theme.featureColor}
              stroke-width="3.5"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M134 78 Q141 83 148 78"
              stroke={theme.featureColor}
              stroke-width="3.5"
              stroke-linecap="round"
              fill="none"
            />
            <circle cx="122" cy="89" r="2.2" fill={theme.featureColor} />
          {:else if mood === "celebrate" || mood === "poked" || mood === "walking"}
            <path
              d="M96 81 Q103 70 110 81"
              stroke={theme.featureColor}
              stroke-width="3.8"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M134 81 Q141 70 148 81"
              stroke={theme.featureColor}
              stroke-width="3.8"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M114 87 L130 87 C130 96, 114 96, 114 87 Z"
              fill={theme.featureColor}
            />
            <path
              d="M118 91 C120 93, 124 93, 126 91"
              stroke={theme.buttonA}
              stroke-width="2"
              stroke-linecap="round"
            />
          {:else if mood === "dragged"}
            <path
              d="M96 73 L107 78 L96 83"
              stroke={theme.featureColor}
              stroke-width="3.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <path
              d="M148 73 L137 78 L148 83"
              stroke={theme.featureColor}
              stroke-width="3.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <ellipse
              cx="122"
              cy="90"
              rx="4.5"
              ry="5.5"
              fill={theme.featureColor}
            />
          {:else}
            <g class="eye-left" transform="translate(103, 76)">
              <rect
                x="-7"
                y="-8"
                width="14"
                height="16"
                rx="5.5"
                fill={theme.featureColor}
              />
              <circle class="pupil" cx="2" cy="-2.5" r="2.6" fill="#ffffff" />
              <circle cx="-2.5" cy="3" r="1.2" fill="#ffffff" opacity="0.7" />
              <rect
                class="eyelid"
                x="-8"
                y="-9"
                width="16"
                height={eyelidHeight}
                rx="3"
                fill={theme.screenTop}
              />
            </g>

            <g class="eye-right" transform="translate(141, 76)">
              <rect
                x="-7"
                y="-8"
                width="14"
                height="16"
                rx="5.5"
                fill={theme.featureColor}
              />
              <circle class="pupil" cx="2" cy="-2.5" r="2.6" fill="#ffffff" />
              <circle cx="-2.5" cy="3" r="1.2" fill="#ffffff" opacity="0.7" />
              <rect
                class="eyelid"
                x="-8"
                y="-9"
                width="16"
                height={eyelidHeight}
                rx="3"
                fill={theme.screenTop}
              />
            </g>

            {#if mood === "warning"}
              <line
                x1="94"
                y1="64"
                x2="111"
                y2="69"
                stroke={theme.featureColor}
                stroke-width="3.2"
                stroke-linecap="round"
              />
              <line
                x1="150"
                y1="64"
                x2="133"
                y2="69"
                stroke={theme.featureColor}
                stroke-width="3.2"
                stroke-linecap="round"
              />
              <path
                d="M115 92 Q122 87 129 92"
                stroke={theme.featureColor}
                stroke-width="3"
                stroke-linecap="round"
                fill="none"
              />
            {:else if mood === "nag"}
              <line
                x1="94"
                y1="68"
                x2="109"
                y2="64"
                stroke={theme.featureColor}
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <line
                x1="150"
                y1="68"
                x2="135"
                y2="64"
                stroke={theme.featureColor}
                stroke-width="2.8"
                stroke-linecap="round"
              />
              <rect
                class="tear-stream"
                x="98"
                y="84"
                width="4.5"
                height="13"
                rx="2.2"
                fill="#38bdf8"
              />
              <rect
                class="tear-stream"
                x="141"
                y="84"
                width="4.5"
                height="13"
                rx="2.2"
                fill="#38bdf8"
              />
              <path
                d="M114 93 Q118 89 122 93 Q126 89 130 93"
                stroke={theme.featureColor}
                stroke-width="2.8"
                stroke-linecap="round"
                fill="none"
              />
            {:else if mood === "focus_sad"}
              <line
                x1="94"
                y1="67"
                x2="109"
                y2="64"
                stroke={theme.featureColor}
                stroke-width="2.6"
                stroke-linecap="round"
              />
              <line
                x1="150"
                y1="67"
                x2="135"
                y2="64"
                stroke={theme.featureColor}
                stroke-width="2.6"
                stroke-linecap="round"
              />
              <path
                d="M115 93 Q122 88 129 93"
                stroke={theme.featureColor}
                stroke-width="2.8"
                stroke-linecap="round"
                fill="none"
              />
            {:else}
              <path
                d="M114 88 Q122 95 130 88"
                stroke={theme.featureColor}
                stroke-width="3"
                stroke-linecap="round"
                fill="none"
              />
            {/if}
          {/if}

          <!-- Screen Focus Progress Bar -->
          {#if showScreenProgress}
            <rect
              x="94"
              y="100"
              width="56"
              height="3.5"
              rx="1.75"
              fill="rgba(18, 48, 53, 0.2)"
            />
            <rect
              x="94"
              y="100"
              width={progressBarWidth}
              height="3.5"
              rx="1.75"
              fill={isNearBreak ? "#f43f5e" : theme.featureColor}
            />
          {/if}

          <!-- Near-Break Low Battery Indicator -->
          {#if showLowBattery}
            <g class="low-battery-badge" transform="translate(139, 56)">
              <rect
                x="0"
                y="0"
                width="16"
                height="8.5"
                rx="2"
                fill="#0f172a"
                stroke="#f43f5e"
                stroke-width="1.6"
              />
              <rect
                x="16.5"
                y="2.2"
                width="2"
                height="4"
                rx="0.8"
                fill="#f43f5e"
              />
              <rect
                x="2"
                y="2"
                width="4"
                height="4.5"
                rx="0.8"
                fill="#f43f5e"
              />
            </g>
          {/if}
        </g>

        <!-- Near-Break Sweat Drop -->
        {#if showSweatDrop}
          <path
            class="sweat-drop"
            d="M167 62 C167 62, 173 71, 173 75 C173 79, 170 82, 167 82 C164 82, 161 79, 161 75 C161 71, 167 62, 167 62 Z"
            fill="#38bdf8"
            stroke={theme.bodyStroke}
            stroke-width="2"
          />
        {/if}

        <!-- ================= LOWER CONSOLE CONTROLS (D-PAD & A/B) ================= -->
        <g class="console-controls">
          <path
            d="M90 124 H99 V133 H108 V142 H99 V151 H90 V142 H81 V133 H90 Z"
            fill={theme.dpadFill}
            stroke={theme.bodyStroke}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <circle cx="94.5" cy="137.5" r="2.8" fill="#132a2e" opacity="0.6" />

          <circle
            cx="136"
            cy="144"
            r="7.5"
            fill={theme.buttonB}
            stroke={theme.bodyStroke}
            stroke-width="2.5"
          />
          <circle cx="134" cy="141.5" r="2" fill="rgba(255,255,255,0.55)" />

          <circle
            cx="153"
            cy="133"
            r="7.5"
            fill={theme.buttonA}
            stroke={theme.bodyStroke}
            stroke-width="2.5"
          />
          <circle cx="151" cy="130.5" r="2" fill="rgba(255,255,255,0.55)" />

          <rect
            x="107"
            y="160"
            width="10"
            height="4"
            rx="2"
            transform="rotate(-22 107 160)"
            fill={theme.dpadFill}
            stroke={theme.bodyStroke}
            stroke-width="1.5"
          />
          <rect
            x="121"
            y="160"
            width="10"
            height="4"
            rx="2"
            transform="rotate(-22 121 160)"
            fill={theme.dpadFill}
            stroke={theme.bodyStroke}
            stroke-width="1.5"
          />

          <line
            x1="147"
            y1="158"
            x2="153"
            y2="166"
            stroke={theme.bodyStroke}
            stroke-width="2.2"
            stroke-linecap="round"
            opacity="0.65"
          />
          <line
            x1="153"
            y1="155"
            x2="159"
            y2="163"
            stroke={theme.bodyStroke}
            stroke-width="2.2"
            stroke-linecap="round"
            opacity="0.65"
          />
          <line
            x1="159"
            y1="152"
            x2="165"
            y2="160"
            stroke={theme.bodyStroke}
            stroke-width="2.2"
            stroke-linecap="round"
            opacity="0.65"
          />
        </g>
      </g>
    </g>
  </g>

  <!-- 3. Floating Ambient Effects -->
  {#if mood === "sleeping"}
    <g class="sleep-zzz">
      <text
        x="172"
        y="42"
        font-size="16"
        font-weight="800"
        fill="#7ef3e1"
        stroke={theme.bodyStroke}
        stroke-width="1"
      >
        Z
      </text>
      <text
        x="186"
        y="26"
        font-size="12"
        font-weight="800"
        fill="#7ef3e1"
        stroke={theme.bodyStroke}
        stroke-width="0.8"
      >
        z
      </text>
      <text x="196" y="14" font-size="9" font-weight="800" fill="#7ef3e1">
        z
      </text>
    </g>
  {/if}

  {#if mood === "celebrate"}
    <g class="celebrate-stars">
      <path
        d="M44 55 L48 63 L56 65 L49 71 L51 79 L44 74 L37 79 L39 71 L32 65 L40 63 Z"
        fill="#fbbf24"
        stroke={theme.bodyStroke}
        stroke-width="1.8"
      />
      <path
        d="M194 50 L197 57 L205 58 L199 63 L201 71 L194 67 L187 71 L189 63 L183 58 L191 57 Z"
        fill="#34d399"
        stroke={theme.bodyStroke}
        stroke-width="1.8"
      />
      <circle cx="48" cy="115" r="5" fill="#fb7185" />
      <circle cx="194" cy="112" r="5.5" fill="#38bdf8" />
    </g>
  {/if}
</g>

<style>
  /* Pivot origins in 240x240 SVG coordinate space */
  .whole-rig {
    transform-origin: 120px 185px;
  }
  .upper-body {
    transform-origin: 120px 160px;
  }
  .left-arm {
    transform-origin: 54px 116px;
  }
  .right-arm {
    transform-origin: 186px 116px;
  }
  .left-leg {
    transform-origin: 100px 172px;
  }
  .right-leg {
    transform-origin: 140px 172px;
  }
  .ground-shadow {
    transform-origin: 120px 214px;
  }

  /* 1. IDLE & FOCUS: Ultra-low-CPU stepped breathing (~1-2 redraws/sec instead of 60 FPS) */
  @keyframes vc-breathe-body {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-2.5px);
    }
  }
  @keyframes vc-wave-right {
    0%,
    100% {
      transform: rotate(-125deg);
    }
    50% {
      transform: rotate(-150deg);
    }
  }

  .mood-idle .upper-body {
    animation: vc-breathe-body 3s steps(2, end) infinite;
  }
  .mood-idle .right-arm {
    animation: vc-wave-right 1.2s steps(4, end) infinite;
  }
  .mood-idle .left-arm {
    transform: rotate(10deg);
  }

  /* FOCUS (25 min): Static resting limbs + calm 4s stepped breath = ~0% CPU */
  .mood-focus .upper-body {
    animation: vc-breathe-body 4s steps(2, end) infinite;
  }
  .mood-focus .left-arm {
    transform: rotate(14deg);
  }
  .mood-focus .right-arm {
    transform: rotate(-14deg);
  }

  .mood-focus.near-break .upper-body,
  .mood-focus_sad .upper-body {
    transform: translateY(3px) rotate(-1.5deg);
  }
  .mood-focus_sad .left-arm {
    transform: rotate(6deg) translateY(4px);
  }
  .mood-focus_sad .right-arm {
    transform: rotate(-6deg) translateY(4px);
  }

  /* 3. WALKING (5 min Break): Smooth stepped run/walk at 10 FPS (steps(6)) */
  @keyframes vc-run-bounce {
    0%,
    100% {
      transform: translateY(0px) rotate(2deg);
    }
    25% {
      transform: translateY(-8px) rotate(3deg);
    }
    50% {
      transform: translateY(0px) rotate(2deg);
    }
    75% {
      transform: translateY(-8px) rotate(1deg);
    }
  }
  @keyframes vc-leg-l {
    0%,
    100% {
      transform: rotate(32deg) translateY(-2px);
    }
    50% {
      transform: rotate(-32deg) translateY(0px);
    }
  }
  @keyframes vc-leg-r {
    0%,
    100% {
      transform: rotate(-32deg) translateY(0px);
    }
    50% {
      transform: rotate(32deg) translateY(-2px);
    }
  }
  @keyframes vc-arm-l {
    0%,
    100% {
      transform: rotate(-40deg);
    }
    50% {
      transform: rotate(45deg);
    }
  }
  @keyframes vc-arm-r {
    0%,
    100% {
      transform: rotate(45deg);
    }
    50% {
      transform: rotate(-40deg);
    }
  }

  .mood-walking .whole-rig {
    animation: vc-run-bounce 0.65s steps(6, end) infinite;
  }
  .mood-walking .left-leg {
    animation: vc-leg-l 0.65s steps(6, end) infinite;
  }
  .mood-walking .right-leg {
    animation: vc-leg-r 0.65s steps(6, end) infinite;
  }
  .mood-walking .left-arm {
    animation: vc-arm-l 0.65s steps(6, end) infinite;
  }
  .mood-walking .right-arm {
    animation: vc-arm-r 0.65s steps(6, end) infinite;
  }

  /* 4. WARNING */
  @keyframes vc-warn-sway {
    0%,
    100% {
      transform: translateX(-1.5px);
    }
    50% {
      transform: translateX(1.5px);
    }
  }
  .mood-warning .upper-body {
    animation: vc-warn-sway 1s steps(2, end) infinite;
  }
  .mood-warning .left-arm {
    transform: rotate(-34deg) translate(6px, -4px);
  }
  .mood-warning .right-arm {
    transform: rotate(34deg) translate(-6px, -4px);
  }

  /* 5. SLEEPING */
  @keyframes vc-sleep-float {
    0%,
    100% {
      transform: translateY(0px);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }
  .mood-sleeping .sleep-zzz {
    animation: vc-sleep-float 3s steps(2, end) infinite;
  }

  /* 6. NAG */
  @keyframes vc-nag-shiver {
    0%,
    100% {
      transform: translateX(-1px);
    }
    50% {
      transform: translateX(1px);
    }
  }
  .mood-nag .upper-body {
    animation: vc-nag-shiver 0.5s steps(2, end) infinite;
  }
  .mood-nag .left-arm {
    transform: rotate(28deg);
  }
  .mood-nag .right-arm {
    transform: rotate(-28deg);
  }

  /* 7. CELEBRATE (only lasts 3 seconds) */
  @keyframes vc-celebrate-jump {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    20% {
      transform: translateY(4px) scale(1.05, 0.94);
    }
    50% {
      transform: translateY(-18px) scale(0.97, 1.04) rotate(4deg);
    }
    75% {
      transform: translateY(-6px) rotate(-4deg);
    }
  }
  .mood-celebrate .whole-rig {
    animation: vc-celebrate-jump 0.8s ease-in-out infinite;
  }
  .mood-celebrate .left-arm {
    transform: rotate(140deg);
  }
  .mood-celebrate .right-arm {
    transform: rotate(-140deg);
  }

  /* 8. POKED (only lasts 1 second, 1 iteration) */
  @keyframes vc-poke-squash {
    0% {
      transform: scale(1.1, 0.88) translateY(5px);
    }
    55% {
      transform: scale(0.96, 1.05) translateY(-3px);
    }
    100% {
      transform: scale(1, 1) translateY(0px);
    }
  }
  .mood-poked .whole-rig {
    animation: vc-poke-squash 0.4s ease-out 1;
  }
  .mood-poked .left-arm {
    transform: rotate(55deg);
  }
  .mood-poked .right-arm {
    transform: rotate(-55deg);
  }

  /* 9. DRAGGED (only while actively dragging) */
  @keyframes vc-dangle-leg-l {
    0%,
    100% {
      transform: rotate(15deg);
    }
    50% {
      transform: rotate(-12deg);
    }
  }
  @keyframes vc-dangle-leg-r {
    0%,
    100% {
      transform: rotate(-15deg);
    }
    50% {
      transform: rotate(12deg);
    }
  }
  .mood-dragged .left-leg {
    animation: vc-dangle-leg-l 0.45s steps(4, end) infinite;
  }
  .mood-dragged .right-leg {
    animation: vc-dangle-leg-r 0.45s steps(4, end) infinite;
  }
  .mood-dragged .left-arm {
    transform: rotate(115deg);
  }
  .mood-dragged .right-arm {
    transform: rotate(-115deg);
  }

  /* Sweat drop & Low Battery animations using low-CPU stepped frames */
  @keyframes vc-sweat-drop {
    0% {
      transform: translateY(0px);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: translateY(14px);
      opacity: 0;
    }
  }
  @keyframes vc-battery-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }
  .sweat-drop {
    animation: vc-sweat-drop 2.4s steps(5, end) infinite;
  }
  .low-battery-badge,
  .near-break .power-led {
    animation: vc-battery-blink 1.4s steps(2, end) infinite;
  }

  .reduced-motion,
  .reduced-motion * {
    animation: none !important;
    transition: none !important;
  }
</style>
