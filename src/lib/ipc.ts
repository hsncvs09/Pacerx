import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createMockApi } from "./mock";
import type {
  Command,
  DailyStats,
  DomainEvent,
  Rect,
  Settings,
  Snapshot,
} from "./types";

export interface Api {
  getSnapshot(): Promise<Snapshot>;
  send(cmd: Command): Promise<Snapshot>;
  todayStats(): Promise<DailyStats>;
  getSettings(): Promise<Settings>;
  setCharacter(id: string): Promise<Settings>;
  setHitRegions(rects: Rect[]): Promise<void>;
  onSnapshot(cb: (snap: Snapshot) => void): Promise<() => void>;
  onEvent(cb: (ev: DomainEvent) => void): Promise<() => void>;
  onSettings(cb: (settings: Settings) => void): Promise<() => void>;
  startDragging(): Promise<void>;
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function createTauriApi(): Api {
  return {
    getSnapshot: () => invoke<Snapshot>("get_snapshot"),
    send: (cmd: Command) => invoke<Snapshot>("send_command", { cmd }),
    todayStats: () => invoke<DailyStats>("get_today_stats"),
    getSettings: () => invoke<Settings>("get_settings"),
    setCharacter: (id: string) => invoke<Settings>("set_character", { id }),
    setHitRegions: (rects: Rect[]) => invoke<void>("set_hit_regions", { rects }),
    onSnapshot: (cb) =>
      listen<Snapshot>("session://snapshot", (e) => cb(e.payload)),
    onEvent: (cb) =>
      listen<DomainEvent>("session://event", (e) => cb(e.payload)),
    onSettings: (cb) =>
      listen<Settings>("settings://changed", (e) => cb(e.payload)),
    startDragging: () => getCurrentWindow().startDragging(),
  };
}

export const api: Api = isTauriRuntime() ? createTauriApi() : createMockApi();
