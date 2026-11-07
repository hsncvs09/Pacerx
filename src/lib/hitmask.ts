import { isTransparentChar } from "./pixel/compile";
import type { Rect } from "./types";

/**
 * Computes the union opaque hit-mask rectangles from a list of ASCII sprite layers.
 * Consecutive rows with identical horizontal run intervals are merged vertically
 * to keep the rectangle count compact (~20-40 rects for a 32x40 character).
 */
export function computeHitMask(
  layers: ReadonlyArray<ReadonlyArray<string>>,
  scale = 5,
  offsetX = 0,
  offsetY = 0,
): Rect[] {
  if (layers.length === 0 || layers[0].length === 0) {
    return [];
  }

  const height = layers[0].length;
  const width = layers[0][0]?.length ?? 0;
  if (width === 0) return [];

  // Build union boolean mask
  const opaque: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );

  for (const layer of layers) {
    for (let y = 0; y < Math.min(height, layer.length); y++) {
      const row = layer[y];
      for (let x = 0; x < Math.min(width, row.length); x++) {
        if (!isTransparentChar(row[x])) {
          opaque[y][x] = true;
        }
      }
    }
  }

  // Extract horizontal runs per row and merge identical runs vertically
  const rawRects: Rect[] = [];
  let activeRuns = new Map<string, Rect>();

  for (let y = 0; y < height; y++) {
    const nextRuns = new Map<string, Rect>();
    let x = 0;
    while (x < width) {
      if (!opaque[y][x]) {
        x++;
        continue;
      }
      let len = 1;
      while (x + len < width && opaque[y][x + len]) {
        len++;
      }
      const key = `${x}:${len}`;
      const existing = activeRuns.get(key);
      if (existing) {
        existing.h += 1;
        nextRuns.set(key, existing);
        activeRuns.delete(key);
      } else {
        nextRuns.set(key, { x, y, w: len, h: 1 });
      }
      x += len;
    }

    for (const finished of activeRuns.values()) {
      rawRects.push(finished);
    }
    activeRuns = nextRuns;
  }

  for (const finished of activeRuns.values()) {
    rawRects.push(finished);
  }

  return rawRects.map((r) => ({
    x: offsetX + r.x * scale,
    y: offsetY + r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  }));
}
