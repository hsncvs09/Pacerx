import type { Rect } from "../../lib/types";
import { ALL_MOODS, type CharacterPack } from "../types";
import CharacterBuddy from "./CharacterBuddy.svelte";

const BYTE_BASE_RECTS: ReadonlyArray<Rect> = [
  // 3D Konsol Ana Gövde
  { x: 50, y: 38, w: 140, h: 154 },
  // Sol Kol ve El Bölgesi
  { x: 28, y: 95, w: 26, h: 75 },
  // Sağ Kol ve El Bölgesi
  { x: 186, y: 95, w: 26, h: 75 },
  // Ayaklar
  { x: 80, y: 190, w: 80, h: 20 },
];

export function computeByteHitMask(
  scale = 160 / 240,
  offsetX = 0,
  offsetY = 0,
): Rect[] {
  return BYTE_BASE_RECTS.map((r) => ({
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  }));
}

export const pack: CharacterPack = {
  id: "byte",
  name: "Byte",
  component: CharacterBuddy as CharacterPack["component"],
  viewBoxWidth: 240,
  viewBoxHeight: 240,
  pixelArt: false,
  moods: ALL_MOODS,
  hitMask: (scale = 160 / 240, offsetX = 0, offsetY = 0) =>
    computeByteHitMask(scale, offsetX, offsetY),
};

export default pack;
