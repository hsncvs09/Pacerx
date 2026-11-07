<script lang="ts">
  import type { BubbleContent, Command, Rect } from "./types";

  interface Props {
    bubble: BubbleContent | null;
    onCommand: (cmd: Command) => void;
    onRectChange: (rect: Rect | null) => void;
  }

  let { bubble, onCommand, onRectChange }: Props = $props();
  let bubbleEl: HTMLDivElement | undefined = $state();

  // Derive primitive key so ResizeObserver is only recreated when bubble content actually changes
  const bubbleKey = $derived(
    bubble
      ? `${bubble.text}|${bubble.actions?.map((a) => a.command).join(",") ?? ""}`
      : "",
  );

  function measure() {
    if (!bubbleKey || !bubbleEl) {
      onRectChange(null);
      return;
    }
    const r = bubbleEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      onRectChange({
        x: Math.round(r.left),
        y: Math.round(r.top),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    } else {
      onRectChange(null);
    }
  }

  $effect(() => {
    if (!bubbleKey || !bubbleEl) {
      onRectChange(null);
      return;
    }
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(bubbleEl);
    return () => {
      ro.disconnect();
    };
  });
</script>

<div class="bubble-slot">
  {#if bubble}
    <div bind:this={bubbleEl} class="bubble" role="status">
      <div class="bubble-text">{bubble.text}</div>
      {#if bubble.actions && bubble.actions.length > 0}
        <div class="bubble-actions">
          {#each bubble.actions as act}
            <button
              type="button"
              class="bubble-btn"
              class:primary={act.primary}
              onclick={() => onCommand(act.command)}
            >
              {act.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .bubble-slot {
    min-height: 92px;
    flex-shrink: 0;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 4px 6px 2px;
    box-sizing: border-box;
  }

  .bubble {
    position: relative;
    max-width: 196px;
    background: #fffdf5;
    border: 2px solid #1b2a2a;
    border-radius: 8px;
    padding: 5px 8px;
    color: #1b2a2a;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 2px 0 rgba(27, 42, 42, 0.25);
    pointer-events: auto;
  }

  .bubble::after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px 5px 0;
    border-style: solid;
    border-color: #1b2a2a transparent transparent;
  }

  .bubble-actions {
    display: flex;
    gap: 4px;
    justify-content: center;
    margin-top: 5px;
    flex-wrap: wrap;
  }

  .bubble-btn {
    font-family: inherit;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 4px;
    border: 1.5px solid #1b2a2a;
    background: #e6ece8;
    color: #1b2a2a;
    cursor: pointer;
  }

  .bubble-btn.primary {
    background: #48d1b5;
  }

  .bubble-btn:hover {
    filter: brightness(0.95);
  }
</style>
