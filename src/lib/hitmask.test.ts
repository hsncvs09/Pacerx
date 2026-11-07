import { describe, expect, it } from "vitest";
import { computeHitMask } from "./hitmask";
import type { Rect } from "./types";

function containsPoint(rects: Rect[], px: number, py: number): boolean {
  return rects.some(
    (r) => px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h,
  );
}

describe("computeHitMask", () => {
  it("computes scaled and offset rectangles and merges identical vertical runs", () => {
    const layerA = [
      "..KK..",
      "..KK..",
      "......",
    ];
    const layerB = [
      "......",
      "A....A",
      "A....A",
    ];

    // Union opaque map:
    // row 0: ..KK.. -> run (2..4)
    // row 1: A.KK.A -> runs (0..1), (2..4), (5..6)
    // row 2: A....A -> runs (0..1), (5..6)
    // With vertical merging of matching runs:
    // (2,0,w=2,h=2), (0,1,w=1,h=2), (5,1,w=1,h=2) => 3 rects!
    const rects = computeHitMask([layerA, layerB], 5, 10, 20);
    expect(rects).toHaveLength(3);

    // Check opaque points are covered
    expect(containsPoint(rects, 10 + 2 * 5 + 1, 20 + 0 * 5 + 1)).toBe(true);
    expect(containsPoint(rects, 10 + 0 * 5 + 1, 20 + 2 * 5 + 1)).toBe(true);
    expect(containsPoint(rects, 10 + 5 * 5 + 1, 20 + 1 * 5 + 1)).toBe(true);

    // Check transparent gap between arm (x=0) and body (x=2) at x=1 is NOT covered
    expect(containsPoint(rects, 10 + 1 * 5 + 2, 20 + 1 * 5 + 2)).toBe(false);
    // Check transparent center at row 2 (x=3) is NOT covered
    expect(containsPoint(rects, 10 + 3 * 5 + 2, 20 + 2 * 5 + 2)).toBe(false);
  });

  it("returns empty array for empty input", () => {
    expect(computeHitMask([])).toEqual([]);
  });
});
