import type { Rect } from "../../lib/types";
import { ALL_MOODS, type CharacterPack } from "../types";
import VectorConsoleBuddy from "../vector/VectorConsoleBuddy.svelte";
import { mintVectorTheme } from "../vector/theme";

export { mintVectorTheme as mintTheme };

/**
 * Tight hit-mask rectangles in 240x240 vector coordinate space:
 * covers the top cartridge lip, main console shell, left/right arms, and legs/shoes.
 */
const VECTOR_BASE_RECTS: ReadonlyArray<Rect> = [
  { x: 90, y: 28, w: 60, h: 8 },   // top cartridge slot
  { x: 57, y: 35, w: 123, h: 142 }, // main console body + volume dial
  { x: 38, y: 100, w: 24, h: 60 },  // left arm reach
  { x: 178, y: 100, w: 24, h: 60 }, // right arm reach
  { x: 82, y: 175, w: 76, h: 32 },  // legs & sneakers
];

export function computeVectorHitMask(
  scale = 160 / 240,
  offsetX = 0,
  offsetY = 0,
): Rect[] {
  return VECTOR_BASE_RECTS.map((r) => ({
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  }));
}

export const pack: CharacterPack = {
  id: "mint",
  name: "Mint",
  component: VectorConsoleBuddy as CharacterPack["component"],
  theme: mintVectorTheme,
  viewBoxWidth: 240,
  viewBoxHeight: 240,
  pixelArt: false,
  hitMask: (scale = 160 / 240, offsetX = 0, offsetY = 0) =>
    computeVectorHitMask(scale, offsetX, offsetY),
  moods: ALL_MOODS,
};
