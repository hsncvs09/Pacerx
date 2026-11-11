import type { Rect } from "../../lib/types";
import { ALL_MOODS, type CharacterPack } from "../types";
import CharacterBuddy from "./CharacterBuddy.svelte";

/**
 * 240x240 koordinat sisteminde Filiz (Sprout) karakterinin kapladığı
 * tıklanabilir (click-through olmayan) dikdörtgen bölgeler.
 */
const SPROUT_BASE_RECTS: ReadonlyArray<Rect> = [
  // Üst Yapraklar, Sap ve Çiçek/Tomurcuk Bölgesi
  { x: 56, y: 28, w: 128, h: 98 },
  // Alt Terracotta Saksı Gövdesi ve Kemer Bölgesi
  { x: 64, y: 126, w: 112, h: 88 },
];

export function computeSproutHitMask(
  scale = 160 / 240,
  offsetX = 0,
  offsetY = 0,
): Rect[] {
  return SPROUT_BASE_RECTS.map((r) => ({
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  }));
}

export const pack: CharacterPack = {
  id: "sprout",
  name: "Sprout",
  component: CharacterBuddy as CharacterPack["component"],
  viewBoxWidth: 240,
  viewBoxHeight: 240,
  pixelArt: false,
  moods: ALL_MOODS,
  hitMask: (scale = 160 / 240, offsetX = 0, offsetY = 0) =>
    computeSproutHitMask(scale, offsetX, offsetY),
};

export default pack;
