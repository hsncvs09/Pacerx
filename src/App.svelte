<script lang="ts">
  import { onMount } from "svelte";
  import CharacterStage from "./lib/CharacterStage.svelte";
  import Gallery from "./lib/Gallery.svelte";
  import SpeechBubble from "./lib/SpeechBubble.svelte";
  import { api } from "./lib/ipc";
  import {
    CELEBRATE_DURATION_MS,
    POKE_DURATION_MS,
    bubbleFor,
    deriveMood,
    formatMmSs,
  } from "./lib/mood";
  import { playChimeDown, playChimeUp, unlockAudio } from "./lib/sound";
  import type {
    Command,
    InteractionState,
    Rect,
    Settings,
    Snapshot,
  } from "./lib/types";

  let isGallery = $state(
    typeof window !== "undefined" &&
      (window.location.hash === "#gallery" ||
        window.location.hash === "#/gallery"),
  );

  let snapshot = $state<Snapshot>({
    phase: "idle",
    remaining_secs: 1500,
    total_secs: 1500,
    paused: false,
    sad: false,
    input_recent: false,
  });

  let settings = $state<Settings>({
    version: 1,
    character_id: "mint",
  });

  let ix = $state<InteractionState>({
    dragging: false,
    pokedUntil: 0,
    celebrateUntil: 0,
  });

  let nowMs = $state<number>(Date.now());
  let reducedMotion = $state<boolean>(false);

  let charRects: Rect[] = [];
  let bubbleRect: Rect | null = null;
  let lastSentHitKey = "";

  const mood = $derived(deriveMood(snapshot, ix, nowMs));
  const bubble = $derived(bubbleFor(mood, snapshot));
  const isViolationMode = $derived(
    snapshot.phase === "nag" ||
      (snapshot.phase === "break" && snapshot.input_recent),
  );
  const progressRatio = $derived(
    snapshot.total_secs > 0
      ? isViolationMode
        ? Math.max(0, Math.min(1, snapshot.remaining_secs / snapshot.total_secs))
        : snapshot.phase === "break" &&
            snapshot.remaining_secs > snapshot.total_secs
          ? 1
          : Math.max(
              0,
              Math.min(
                1,
                (snapshot.total_secs - snapshot.remaining_secs) /
                  snapshot.total_secs,
              ),
            )
      : 0,
  );

  function syncHitRegions() {
    if (isGallery) return;
    const merged: Rect[] = [...charRects];
    if (bubbleRect) {
      merged.push(bubbleRect);
    }
    const key = merged
      .map(
        (r) =>
          `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.w)},${Math.round(r.h)}`,
      )
      .join(";");
    if (key === lastSentHitKey) return;
    lastSentHitKey = key;
    api.setHitRegions(merged).catch(() => {});
  }

  function handleCharHitMask(rects: Rect[]) {
    charRects = rects;
    syncHitRegions();
  }

  function handleBubbleRect(rect: Rect | null) {
    bubbleRect = rect;
    syncHitRegions();
  }

  function scheduleTimerRefresh(durationMs: number) {
    setTimeout(() => {
      nowMs = Date.now();
    }, durationMs + 20);
  }

  function handlePoke() {
    unlockAudio();
    const now = Date.now();
    nowMs = now;
    ix = { ...ix, pokedUntil: now + POKE_DURATION_MS };
    scheduleTimerRefresh(POKE_DURATION_MS);
  }

  async function handleDoubleClick() {
    unlockAudio();
    const cmd: Command =
      snapshot.phase === "idle"
        ? "start"
        : snapshot.phase === "nag"
          ? "accept_break"
          : "toggle_pause";
    snapshot = await api.send(cmd);
    nowMs = Date.now();
  }

  async function handleDragStart() {
    if (ix.dragging) return;
    ix = { ...ix, dragging: true };
    nowMs = Date.now();
    // Komutu hemen gönder: ilk çağrıda AudioContext oluşturmak JS thread'ini
    // bloklayıp sürüklemenin gecikmeli başlamasına neden oluyordu.
    const dragPromise = api.startDragging();
    try {
      await dragPromise;
    } finally {
      ix = { ...ix, dragging: false };
      nowMs = Date.now();
      unlockAudio();
    }
  }

  function handleDragEnd() {
    // Sürükleme durumu Tauri ve mock ortamında api.startDragging() yaşam döngüsüyle yönetilir.
    // Windows/Chromium imleç kontrolünü devraldığında tetiklenen pointercancel/buttons=0 olaylarının
    // sürükleme animasyonunu erkenden kesmesi engellenir.
  }

  async function handleCommand(cmd: Command) {
    unlockAudio();
    ix = { ...ix, pokedUntil: 0, celebrateUntil: 0 };
    snapshot = await api.send(cmd);
    nowMs = Date.now();
  }

  onMount(() => {
    const onHashChange = () => {
      isGallery =
        window.location.hash === "#gallery" ||
        window.location.hash === "#/gallery";
      document.body.style.overflow = isGallery ? "auto" : "hidden";
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mq.addEventListener("change", onMqChange);

    // AudioContext'i etkileşimden bağımsız, boşta bir anda önceden oluştur;
    // böylece ilk sürükleme/tıklama sırasında ağır ses kurulumu yaşanmaz.
    const warmAudio = setTimeout(() => unlockAudio(), 1500);

    api
      .getSnapshot()
      .then((s) => {
        snapshot = s;
      })
      .catch(() => {});

    api
      .getSettings()
      .then((st) => {
        settings = st;
      })
      .catch(() => {});

    const unsubSnap = api.onSnapshot((s) => {
      if ((s.phase !== "break" || s.input_recent) && ix.celebrateUntil > 0) {
        ix = { ...ix, celebrateUntil: 0 };
      }
      snapshot = s;
    });

    const unsubEv = api.onEvent((ev) => {
      const now = Date.now();
      nowMs = now;
      if (ev.type === "focus_completed") {
        playChimeUp();
        ix = { ...ix, celebrateUntil: now + CELEBRATE_DURATION_MS };
        scheduleTimerRefresh(CELEBRATE_DURATION_MS);
      } else if (ev.type === "break_completed") {
        playChimeDown();
      }
    });

    const unsubSettings = api.onSettings((st) => {
      settings = st;
    });

    return () => {
      clearTimeout(warmAudio);
      window.removeEventListener("hashchange", onHashChange);
      mq.removeEventListener("change", onMqChange);
      unsubSnap.then((fn) => fn());
      unsubEv.then((fn) => fn());
      unsubSettings.then((fn) => fn());
    };
  });
</script>

{#if isGallery && import.meta.env.DEV}
  <Gallery />
{:else}
  <main class="companion-root">
    <SpeechBubble
      {bubble}
      onCommand={handleCommand}
      onRectChange={handleBubbleRect}
    />

    <CharacterStage
      characterId={settings.character_id}
      {mood}
      {snapshot}
      {reducedMotion}
      onPoke={handlePoke}
      onDoubleClick={handleDoubleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onHitMaskChange={handleCharHitMask}
    />

    <div class="hud" aria-hidden="true">
      <div class="timer-label">{formatMmSs(snapshot.remaining_secs)}</div>
      <div
        class="phase-bar"
        data-phase={isViolationMode ? "nag" : snapshot.phase}
      >
        <div
          class="phase-fill"
          style:width={`${Math.round(progressRatio * 100)}%`}
        ></div>
      </div>
    </div>
  </main>
{/if}

<style>
  .companion-root {
    width: 210px;
    height: 310px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .hud {
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 96px;
  }

  .timer-label {
    font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
    font-size: 11px;
    font-weight: 800;
    color: #fffdf5;
    text-shadow:
      -1px -1px 0 #1b2a2a,
      1px -1px 0 #1b2a2a,
      -1px 1px 0 #1b2a2a,
      1px 1px 0 #1b2a2a;
    line-height: 1;
  }

  .phase-bar {
    width: 100%;
    height: 4px;
    background: rgba(27, 42, 42, 0.65);
    border: 1px solid #1b2a2a;
    border-radius: 3px;
    overflow: hidden;
  }

  .phase-fill {
    height: 100%;
    background: #48d1b5;
  }

  .phase-bar[data-phase="break"] .phase-fill {
    background: #ffd166;
  }

  .phase-bar[data-phase="nag"] .phase-fill {
    background: #ff6b6b;
  }
</style>
