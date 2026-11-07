<script lang="ts">
  import {
    compileLayeredSprite,
    type CompiledPath,
  } from "../../lib/pixel/compile";
  import type { Mood, Snapshot } from "../../lib/types";
  import "./console.css";
  import {
    arms,
    body,
    effects,
    faces,
    legs,
    type ArmId,
    type EffectId,
    type FaceId,
    type LegId,
  } from "./sprites";
  import type { ConsoleTheme } from "./theme";

  interface Props {
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
    theme: ConsoleTheme;
  }

  let { mood, snapshot, reducedMotion, theme }: Props = $props();

  let frameIndex = $state(0);
  let blinking = $state(false);
  let pageHidden = $state(false);

  const compileCache = new Map<string, CompiledPath[]>();

  interface PoseSpec {
    face: FaceId;
    arms: ArmId[];
    legs: LegId[];
    effect: EffectId;
    animClass: string;
    fps: number;
    canBlink: boolean;
    showCard: boolean;
  }

  function getPoseSpec(m: Mood, hasCardAccessory: boolean): PoseSpec {
    switch (m) {
      case "dragged":
        return {
          face: "xx",
          arms: ["wave1", "wave2"],
          legs: ["dangle"],
          effect: "none",
          animClass: "anim-dangle",
          fps: 6,
          canBlink: false,
          showCard: false,
        };
      case "poked":
        return {
          face: "squint",
          arms: [hasCardAccessory ? "holdCard" : "wave1"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-squash",
          fps: 0,
          canBlink: false,
          showCard: hasCardAccessory,
        };
      case "celebrate":
        return {
          face: "squint",
          arms: ["thumbsUp"],
          legs: ["walk1", "walk2"],
          effect: "confetti",
          animClass: "anim-jump",
          fps: 4,
          canBlink: false,
          showCard: false,
        };
      case "nag":
        return {
          face: "tear",
          arms: [hasCardAccessory ? "holdCard" : "rest"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-nag",
          fps: 0,
          canBlink: false,
          showCard: hasCardAccessory,
        };
      case "sleeping":
        return {
          face: "sleep",
          arms: ["rest"],
          legs: ["stand"],
          effect: "zzz",
          animClass: "anim-sleep",
          fps: 0,
          canBlink: false,
          showCard: false,
        };
      case "warning":
        return {
          face: "angry",
          arms: ["hips"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-warning",
          fps: 0,
          canBlink: false,
          showCard: false,
        };
      case "walking":
        return {
          face: "happy",
          arms: ["swing1", "swing2"],
          legs: ["walk1", "walk2"],
          effect: "none",
          animClass: "anim-walk",
          fps: 4,
          canBlink: false,
          showCard: false,
        };
      case "focus_sad":
        return {
          face: "sad",
          arms: [hasCardAccessory ? "holdCard" : "rest"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-breathe-slow",
          fps: 0,
          canBlink: false,
          showCard: hasCardAccessory,
        };
      case "focus":
        return {
          face: "happy",
          arms: [hasCardAccessory ? "holdCard" : "rest"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-breathe-slow",
          fps: 0,
          canBlink: true,
          showCard: hasCardAccessory,
        };
      case "idle":
      default:
        return {
          face: "happy",
          arms: ["wave1", "wave2"],
          legs: ["stand"],
          effect: "none",
          animClass: "anim-breathe",
          fps: 2,
          canBlink: true,
          showCard: hasCardAccessory,
        };
    }
  }

  // Visibility listener to pause JS loops when window/document is hidden
  $effect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      pageHidden = document.hidden;
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  });

  // Frame loop (only runs when current mood has fps > 0 and motion is enabled)
  $effect(() => {
    const spec = getPoseSpec(mood, theme.accessory === "card");
    frameIndex = 0;
    if (reducedMotion || pageHidden || spec.fps <= 0) {
      return;
    }
    const intervalMs = Math.round(1000 / spec.fps);
    const id = setInterval(() => {
      frameIndex = (frameIndex + 1) % 2;
    }, intervalMs);
    return () => clearInterval(id);
  });

  // Random blink loop (3-6s) when mood allows blinking
  $effect(() => {
    const spec = getPoseSpec(mood, theme.accessory === "card");
    blinking = false;
    if (reducedMotion || pageHidden || !spec.canBlink) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let blinkResetId: ReturnType<typeof setTimeout> | undefined;

    function scheduleNextBlink() {
      const delay = 3000 + Math.floor(Math.random() * 3000);
      timeoutId = setTimeout(() => {
        blinking = true;
        blinkResetId = setTimeout(() => {
          blinking = false;
          scheduleNextBlink();
        }, 160);
      }, delay);
    }

    scheduleNextBlink();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (blinkResetId) clearTimeout(blinkResetId);
    };
  });

  const pose = $derived(getPoseSpec(mood, theme.accessory === "card"));
  const activeFace = $derived<FaceId>(
    pose.canBlink && blinking ? "blink" : pose.face,
  );
  const activeArm = $derived<ArmId>(
    pose.arms[frameIndex % pose.arms.length] ?? "rest",
  );
  const activeLeg = $derived<LegId>(
    pose.legs[frameIndex % pose.legs.length] ?? "stand",
  );

  const compiledPaths = $derived.by(() => {
    const cacheKey = `${theme.id}:${theme.cheeks}:${activeFace}:${activeArm}:${activeLeg}:${pose.effect}:${pose.showCard}`;
    const cached = compileCache.get(cacheKey);
    if (cached) return cached;

    const effectivePalette: Record<string, string> = {
      ...theme.palette,
      C: theme.cheeks
        ? (theme.palette.C ?? "#ff8fa3")
        : (theme.palette.S ?? "#d6f8e3"),
    };

    const layers: string[][] = [
      legs[activeLeg],
      body,
      faces[activeFace],
      arms[activeArm],
    ];
    if (pose.showCard && activeArm !== "holdCard") {
      // Keep card in left hand while right hand waves in idle!
      layers.push(arms.holdCard);
    }
    if (pose.effect !== "none") {
      layers.push(effects[pose.effect]);
    }

    const compiled = compileLayeredSprite(layers, effectivePalette);
    compileCache.set(cacheKey, compiled);
    return compiled;
  });

  const showScreenProgress = $derived(
    mood === "focus" || mood === "focus_sad",
  );
  const screenProgressWidth = $derived.by(() => {
    if (snapshot.total_secs <= 0) return 0;
    const ratio =
      (snapshot.total_secs - snapshot.remaining_secs) / snapshot.total_secs;
    return Math.max(1, Math.min(12, Math.round(ratio * 12)));
  });

  const cardText = $derived.by(() => {
    if (snapshot.phase === "break" || snapshot.phase === "nag" || mood === "walking" || mood === "warning" || mood === "nag") {
      return "Yürü!";
    }
    const mins = Math.max(1, Math.ceil(snapshot.remaining_secs / 60));
    return `${mins}dk`;
  });
</script>

<g
  class="console-buddy-group {pose.animClass}"
  class:reduced-motion={reducedMotion}
>
  {#each compiledPaths as item (item.color)}
    <path d={item.d} fill={item.color} />
  {/each}

  {#if showScreenProgress}
    <rect x="10" y="16" width="12" height="1" fill={theme.palette.E} />
    <rect
      x="10"
      y="16"
      width={screenProgressWidth}
      height="1"
      fill={theme.palette.K}
    />
  {/if}

  {#if pose.showCard}
    <rect x="1" y="14" width="6" height="5" fill={theme.palette.W} />
    <text
      x="4"
      y="17.6"
      text-anchor="middle"
      font-family="ui-monospace, Consolas, monospace"
      font-size="2.2"
      font-weight="800"
      fill={theme.palette.K}
    >
      {cardText}
    </text>
  {/if}
</g>
