<script lang="ts">
  import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../characters/console/sprites";
  import { getAllCharacterPacks } from "../characters/registry";
  import { ALL_MOODS } from "../characters/types";
  import { bubbleFor } from "./mood";
  import type { Mood, Snapshot } from "./types";

  const packs = getAllCharacterPacks();
  let selectedPackId = $state(packs[0]?.id ?? "mint");
  let reducedMotion = $state(false);
  let showHitMask = $state(false);
  let previewNearBreak = $state(false);

  const activePack = $derived(
    packs.find((p) => p.id === selectedPackId) ?? packs[0],
  );
  const vbWidth = $derived(activePack.viewBoxWidth ?? SPRITE_WIDTH);
  const vbHeight = $derived(activePack.viewBoxHeight ?? SPRITE_HEIGHT);
  const isPixelArt = $derived(activePack.pixelArt ?? false);
  const hitRects = $derived(activePack.hitMask(1, 0, 0));

  const MOOD_LABELS: Record<Mood, { title: string; desc: string }> = {
    idle: { title: "idle", desc: "Nefes + göz kırpma + el sallama" },
    focus: {
      title: "focus",
      desc: "Odak + ilerleme çubuğu (molaya yaklaşırken düşük pil & ter)",
    },
    focus_sad: {
      title: "focus_sad",
      desc: "Mola atlandıktan sonra yorgun/üzgün odak (pil + ter damlası)",
    },
    walking: { title: "walking", desc: "Molada akıcı koşu/yürüyüş (dambılsız)" },
    warning: { title: "warning", desc: "Molada klavye/fare uyarısı (eller belde)" },
    sleeping: { title: "sleeping", desc: "Duraklatıldı: kararan ekran + Zzz" },
    nag: { title: "nag", desc: "Mola atlanınca gözyaşı + düşük pil + ısrar" },
    celebrate: { title: "celebrate", desc: "Odak bitti: zıplama + yıldızlar" },
    poked: { title: "poked", desc: "Tek tık dürtme: esnek squash + kalan süre" },
    dragged: { title: "dragged", desc: "Sürüklenirken sallanan bacaklar (> <)" },
  };

  function sampleSnapshotFor(mood: Mood, nearBreak: boolean): Snapshot {
    switch (mood) {
      case "idle":
        return {
          phase: "idle",
          remaining_secs: 1500,
          total_secs: 1500,
          paused: false,
          sad: false,
          input_recent: false,
        };
      case "walking":
      case "warning":
        return {
          phase: "break",
          remaining_secs: 240,
          total_secs: 300,
          paused: false,
          sad: false,
          input_recent: mood === "warning",
        };
      case "nag":
        return {
          phase: "nag",
          remaining_secs: 45,
          total_secs: 60,
          paused: false,
          sad: true,
          input_recent: false,
        };
      case "sleeping":
        return {
          phase: "focus",
          remaining_secs: 840,
          total_secs: 1500,
          paused: true,
          sad: false,
          input_recent: false,
        };
      default:
        return {
          phase: "focus",
          remaining_secs: nearBreak ? 180 : 900,
          total_secs: 1500,
          paused: false,
          sad: mood === "focus_sad",
          input_recent: false,
        };
    }
  }
</script>

<div class="gallery-page">
  <header class="gallery-header">
    <div>
      <h1>Pomodoro Companion — Karakter Galerisi (`/#gallery`)</h1>
      <p>
        Aktif Paket: <strong>{activePack.name}</strong> (`{activePack.id}`) ·
        Tür: <strong>{isPixelArt ? "Piksel-Art" : "Akıcı Vektör SVG (60 FPS)"}</strong> ·
        Hit-mask: <strong>{hitRects.length} dikdörtgen</strong>
      </p>
    </div>

    <div class="controls">
      <label class="ctrl">
        <span>Karakter Seçimi:</span>
        <select bind:value={selectedPackId}>
          {#each packs as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
      </label>

      <label class="ctrl highlight">
        <input type="checkbox" bind:checked={previewNearBreak} />
        <span>Molaya Yakın (`focus` son %20: Düşük Pil + Ter)</span>
      </label>

      <label class="ctrl">
        <input type="checkbox" bind:checked={showHitMask} />
        <span>Hit-mask bölgeleri ({hitRects.length})</span>
      </label>

      <label class="ctrl">
        <input type="checkbox" bind:checked={reducedMotion} />
        <span>Azaltılmış hareket (`reducedMotion`)</span>
      </label>
    </div>
  </header>

  <section class="mood-grid">
    {#each ALL_MOODS as mood (mood)}
      {@const snap = sampleSnapshotFor(mood, previewNearBreak)}
      {@const bubble = bubbleFor(mood, snap)}
      {@const PackComp = activePack.component}
      <article class="mood-card" data-mood={mood}>
        <div class="mood-meta">
          <span class="mood-badge">{MOOD_LABELS[mood].title}</span>
          <span class="mood-desc">{MOOD_LABELS[mood].desc}</span>
        </div>

        <div class="bubble-preview">
          {#if bubble}
            <div class="mini-bubble">{bubble.text}</div>
          {:else}
            <div class="mini-bubble empty">(balon yok)</div>
          {/if}
        </div>

        <div class="sprite-frame">
          <svg
            class:pixel-art={isPixelArt}
            viewBox="0 0 {vbWidth} {vbHeight}"
            width="175"
            height="190"
            shape-rendering={isPixelArt ? "crispEdges" : "geometricPrecision"}
          >
            <PackComp
              {mood}
              snapshot={snap}
              {reducedMotion}
              theme={activePack.theme}
            />
            {#if showHitMask}
              {#each hitRects as r}
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill="rgba(255, 0, 128, 0.22)"
                  stroke="#ff0080"
                  stroke-width={isPixelArt ? "0.18" : "1.4"}
                />
              {/each}
            {/if}
          </svg>
        </div>
      </article>
    {/each}
  </section>
</div>

<style>
  .gallery-page {
    min-height: 100vh;
    background: #0f172a;
    color: #e9f5f2;
    padding: 24px;
    box-sizing: border-box;
    overflow-y: auto;
  }

  .gallery-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid #1e293b;
  }

  .gallery-header h1 {
    margin: 0 0 4px;
    font-size: 20px;
  }

  .gallery-header p {
    margin: 0;
    font-size: 13px;
    color: #94a3b8;
  }

  .controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .ctrl {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    background: #1e293b;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #334155;
    cursor: pointer;
  }

  .ctrl.highlight {
    border-color: #2dd4bf;
    background: rgba(45, 212, 191, 0.12);
  }

  .ctrl select {
    background: #0f172a;
    color: #f8fafc;
    border: 1px solid #475569;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
  }

  .mood-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
    gap: 16px;
  }

  .mood-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .mood-meta {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .mood-badge {
    align-self: flex-start;
    background: #2dd4bf;
    color: #0f172a;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 12px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 5px;
  }

  .mood-desc {
    font-size: 11px;
    color: #cbd5e1;
    line-height: 1.3;
  }

  .bubble-preview {
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-bubble {
    background: #fffdf5;
    color: #172a2a;
    border: 2px solid #172a2a;
    border-radius: 6px;
    padding: 3px 7px;
    font-size: 11px;
    font-weight: 700;
  }

  .mini-bubble.empty {
    background: transparent;
    border-color: transparent;
    color: #64748b;
    font-weight: 500;
  }

  .sprite-frame {
    width: 100%;
    background:
      linear-gradient(45deg, #0f172a 25%, transparent 25%),
      linear-gradient(-45deg, #0f172a 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #0f172a 75%),
      linear-gradient(-45deg, transparent 75%, #0f172a 75%);
    background-size: 16px 16px;
    background-position:
      0 0,
      0 8px,
      8px -8px,
      -8px 0;
    border-radius: 10px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sprite-frame svg {
    overflow: visible;
  }

  .sprite-frame svg.pixel-art {
    image-rendering: pixelated;
  }
</style>
