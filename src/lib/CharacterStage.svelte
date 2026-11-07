<script lang="ts">
  import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../characters/console/sprites";
  import { getCharacterPack } from "../characters/registry";
  import { resolveMood } from "../characters/types";
  import { initialGestureState, stepGesture } from "./interaction";
  import type { Mood, Rect, Snapshot } from "./types";

  interface Props {
    characterId: string;
    mood: Mood;
    snapshot: Snapshot;
    reducedMotion: boolean;
    onPoke: () => void;
    onDoubleClick: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onHitMaskChange: (rects: Rect[]) => void;
  }

  let {
    characterId,
    mood,
    snapshot,
    reducedMotion,
    onPoke,
    onDoubleClick,
    onDragStart,
    onDragEnd,
    onHitMaskChange,
  }: Props = $props();

  let svgEl: SVGSVGElement | undefined = $state();
  let gesture = initialGestureState();
  let lastMaskKey = "";

  const pack = $derived(getCharacterPack(characterId));
  const effectiveMood = $derived(resolveMood(mood, pack.moods));
  const PackComponent = $derived(pack.component);
  const vbWidth = $derived(pack.viewBoxWidth ?? SPRITE_WIDTH);
  const vbHeight = $derived(pack.viewBoxHeight ?? SPRITE_HEIGHT);
  const isPixelArt = $derived(pack.pixelArt ?? false);

  function emitHitMask() {
    if (!svgEl) return;
    const r = svgEl.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;

    const key = `${pack.id}:${Math.round(r.left)}:${Math.round(r.top)}:${Math.round(r.width)}:${Math.round(r.height)}`;
    if (key === lastMaskKey) return;
    lastMaskKey = key;

    const scaleX = r.width / vbWidth;
    const scaleY = r.height / vbHeight;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = r.left + (r.width - vbWidth * scale) / 2;
    const offsetY = r.top + (r.height - vbHeight * scale) / 2;
    const rects = pack.hitMask(scale, offsetX, offsetY);
    onHitMaskChange(rects);
  }

  $effect(() => {
    void pack;
    if (!svgEl) return;
    emitHitMask();
    const ro = new ResizeObserver(() => emitHitMask());
    ro.observe(svgEl);
    return () => ro.disconnect();
  });

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const step = stepGesture(gesture, {
      type: "down",
      x: e.clientX,
      y: e.clientY,
      now: performance.now(),
    });
    gesture = step.state;
  }

  function handlePointerMove(e: PointerEvent) {
    if (gesture.pointerDown && e.buttons === 0) {
      const wasDragging = gesture.dragging;
      gesture = initialGestureState();
      if (wasDragging) onDragEnd();
      return;
    }

    const step = stepGesture(gesture, {
      type: "move",
      x: e.clientX,
      y: e.clientY,
      now: performance.now(),
    });
    gesture = step.state;
    if (step.action === "drag_start") {
      gesture = initialGestureState();
      onDragStart();
    }
  }

  function handlePointerUp(e: PointerEvent) {
    const step = stepGesture(gesture, {
      type: "up",
      x: e.clientX,
      y: e.clientY,
      now: performance.now(),
    });
    gesture = step.state;
    if (step.action === "single_click") {
      onPoke();
    } else if (step.action === "double_click") {
      onDoubleClick();
    } else if (step.action === "drag_end") {
      onDragEnd();
    }
  }

  function handlePointerCancel() {
    const step = stepGesture(gesture, {
      type: "cancel",
      now: performance.now(),
    });
    gesture = step.state;
    if (step.action === "drag_end") {
      onDragEnd();
    }
  }
</script>

<div class="stage-wrap" data-character={pack.id} data-mood={effectiveMood}>
  <svg
    bind:this={svgEl}
    class="character-svg"
    class:pixel-art={isPixelArt}
    viewBox="0 0 {vbWidth} {vbHeight}"
    width="175"
    height="185"
    shape-rendering={isPixelArt ? "crispEdges" : "geometricPrecision"}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerCancel}
    role="button"
    tabindex="0"
    aria-label="{pack.name} ({effectiveMood})"
  >
    <PackComponent
      mood={effectiveMood}
      {snapshot}
      {reducedMotion}
      theme={pack.theme}
    />
  </svg>
</div>

<style>
  .stage-wrap {
    width: 175px;
    height: 185px;
    flex-shrink: 0;
    margin-top: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* No CSS drop-shadow filter on SVG: prevents WebView2 Skia offscreen texture leak and CPU spikes */
  .character-svg {
    width: 175px;
    height: 185px;
    cursor: grab;
    touch-action: none;
    overflow: visible;
  }

  .character-svg.pixel-art {
    width: 160px;
    height: 200px;
    image-rendering: pixelated;
  }

  .character-svg:active {
    cursor: grabbing;
  }
</style>
