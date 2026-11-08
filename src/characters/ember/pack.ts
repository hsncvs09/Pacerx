import type { Rect } from "../../lib/types";
import { ALL_MOODS, type CharacterPack } from "../types";
import CharacterBuddy from "./CharacterBuddy.svelte";

const EMBER_BASE_RECTS: ReadonlyArray<Rect> = [
  { x: 85, y: 38, w: 70, h: 40 },
  { x: 62, y: 78, w: 116, h: 92 },
  { x: 64, y: 168, w: 112, h: 42 },
];

export function computeEmberHitMask(
  scale = 160 / 240,
  offsetX = 0,
  offsetY = 0,
): Rect[] {
  return EMBER_BASE_RECTS.map((r) => ({
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  }));
}

export const pack: CharacterPack = {
  id: "ember",
  name: "Ember",
  component: CharacterBuddy as CharacterPack["component"],
  viewBoxWidth: 240,
  viewBoxHeight: 240,
  pixelArt: false,
  moods: ALL_MOODS,
  hitMask: (scale = 160 / 240, offsetX = 0, offsetY = 0) =>
    computeEmberHitMask(scale, offsetX, offsetY),
};

export default pack;
