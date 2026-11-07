import type { Component } from "svelte";
import type { Mood, Rect, Snapshot } from "../lib/types";
import type { ConsoleTheme } from "./console/theme";
import type { VectorConsoleTheme } from "./vector/theme";

export interface CharacterProps {
  mood: Mood;
  snapshot: Snapshot;
  reducedMotion: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any;
}

export interface CharacterPack {
  id: string;
  name: string;
  component: Component<CharacterProps>;
  theme?: ConsoleTheme | VectorConsoleTheme;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  pixelArt?: boolean;
  hitMask: (scale?: number, offsetX?: number, offsetY?: number) => Rect[];
  moods: readonly Mood[];
  preview?: string;
}

export const ALL_MOODS: readonly Mood[] = [
  "idle",
  "focus",
  "focus_sad",
  "walking",
  "warning",
  "sleeping",
  "nag",
  "celebrate",
  "poked",
  "dragged",
] as const;

export const MOOD_FALLBACK: Record<Mood, Mood> = {
  dragged: "idle",
  poked: "idle",
  celebrate: "idle",
  nag: "focus_sad",
  sleeping: "idle",
  warning: "nag",
  walking: "idle",
  focus_sad: "focus",
  focus: "idle",
  idle: "idle",
};

export function resolveMood(
  requested: Mood,
  supported: readonly Mood[],
): Mood {
  const set = new Set<Mood>(supported);
  let current: Mood = requested;
  for (let i = 0; i < 12; i++) {
    if (set.has(current)) return current;
    const next = MOOD_FALLBACK[current];
    if (!next || next === current) break;
    current = next;
  }
  return set.has("idle") ? "idle" : (supported[0] ?? "idle");
}
