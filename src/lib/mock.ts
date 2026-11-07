import type {
  Command,
  DailyStats,
  DomainEvent,
  Rect,
  Settings,
  Snapshot,
} from "./types";
import type { Api } from "./ipc";

export function createMockApi(): Api {
  const FOCUS_SECS = 25;
  const BREAK_SECS = 5;
  const NAG_SECS = 10;

  let snap: Snapshot = {
    phase: "idle",
    remaining_secs: FOCUS_SECS,
    total_secs: FOCUS_SECS,
    paused: false,
    sad: false,
    input_recent: false,
  };

  let stats: DailyStats = {
    focus_completed: 0,
    breaks_completed: 0,
    breaks_skipped: 0,
  };

  let settings: Settings = {
    version: 1,
    character_id: "mint",
  };

  const snapListeners = new Set<(s: Snapshot) => void>();
  const eventListeners = new Set<(e: DomainEvent) => void>();
  const settingsListeners = new Set<(s: Settings) => void>();

  function emitSnap() {
    const copy = { ...snap };
    snapListeners.forEach((cb) => cb(copy));
  }

  function emitEvent(ev: DomainEvent) {
    eventListeners.forEach((cb) => cb(ev));
  }

  setInterval(() => {
    if (snap.phase === "idle" || snap.paused) return;
    if (snap.remaining_secs > 1) {
      snap = { ...snap, remaining_secs: snap.remaining_secs - 1 };
      emitSnap();
      return;
    }

    if (snap.phase === "focus") {
      stats.focus_completed += 1;
      snap = {
        ...snap,
        phase: "break",
        remaining_secs: BREAK_SECS,
        total_secs: BREAK_SECS,
      };
      emitEvent({ type: "focus_completed" });
      emitEvent({ type: "phase_changed", from: "focus", to: "break" });
      emitSnap();
    } else if (snap.phase === "break") {
      stats.breaks_completed += 1;
      snap = {
        ...snap,
        phase: "focus",
        remaining_secs: FOCUS_SECS,
        total_secs: FOCUS_SECS,
        sad: false,
        input_recent: false,
      };
      emitEvent({ type: "break_completed" });
      emitEvent({ type: "phase_changed", from: "break", to: "focus" });
      emitSnap();
    } else if (snap.phase === "nag") {
      snap = {
        ...snap,
        phase: "focus",
        remaining_secs: FOCUS_SECS,
        total_secs: FOCUS_SECS,
        sad: true,
      };
      emitEvent({ type: "phase_changed", from: "nag", to: "focus" });
      emitSnap();
    }
  }, 1000);

  return {
    async getSnapshot() {
      return { ...snap };
    },
    async send(cmd: Command) {
      if (snap.phase === "idle" && cmd === "start") {
        snap = {
          ...snap,
          phase: "focus",
          remaining_secs: FOCUS_SECS,
          total_secs: FOCUS_SECS,
          paused: false,
        };
        emitEvent({ type: "phase_changed", from: "idle", to: "focus" });
      } else if (
        (snap.phase === "focus" || snap.phase === "break") &&
        cmd === "toggle_pause"
      ) {
        snap = { ...snap, paused: !snap.paused };
      } else if (snap.phase === "break" && cmd === "skip_break") {
        stats.breaks_skipped += 1;
        snap = {
          ...snap,
          phase: "nag",
          remaining_secs: NAG_SECS,
          total_secs: NAG_SECS,
          paused: false,
        };
        emitEvent({ type: "break_skipped" });
        emitEvent({ type: "phase_changed", from: "break", to: "nag" });
      } else if (snap.phase === "nag" && cmd === "accept_break") {
        snap = {
          ...snap,
          phase: "break",
          remaining_secs: BREAK_SECS,
          total_secs: BREAK_SECS,
          paused: false,
        };
        emitEvent({ type: "phase_changed", from: "nag", to: "break" });
      } else if (snap.phase === "nag" && cmd === "continue_anyway") {
        snap = {
          ...snap,
          phase: "focus",
          remaining_secs: FOCUS_SECS,
          total_secs: FOCUS_SECS,
          paused: false,
          sad: true,
        };
        emitEvent({ type: "phase_changed", from: "nag", to: "focus" });
      } else if (snap.phase !== "idle" && cmd === "reset") {
        const prev = snap.phase;
        snap = {
          phase: "idle",
          remaining_secs: FOCUS_SECS,
          total_secs: FOCUS_SECS,
          paused: false,
          sad: false,
          input_recent: false,
        };
        emitEvent({ type: "phase_changed", from: prev, to: "idle" });
      }
      emitSnap();
      return { ...snap };
    },
    async todayStats() {
      return { ...stats };
    },
    async getSettings() {
      return { ...settings };
    },
    async setCharacter(id: string) {
      settings = { ...settings, character_id: id };
      settingsListeners.forEach((cb) => cb({ ...settings }));
      return { ...settings };
    },
    async setHitRegions(_rects: Rect[]) {},
    async onSnapshot(cb) {
      snapListeners.add(cb);
      return () => snapListeners.delete(cb);
    },
    async onEvent(cb) {
      eventListeners.add(cb);
      return () => eventListeners.delete(cb);
    },
    async onSettings(cb) {
      settingsListeners.add(cb);
      return () => settingsListeners.delete(cb);
    },
    async startDragging() {},
  };
}
