import { describe, expect, it } from "vitest";
import { getAllCharacterPacks, getCatalog, getCharacterPack } from "./registry";
import { resolveMood } from "./types";

describe("character registry (vector Mint)", () => {
  it("registers every catalog entry and falls back to mint for unknown ids", () => {
    const catalog = getCatalog();
    const packs = getAllCharacterPacks();
    expect(packs.length).toBe(catalog.length);
    expect(packs.map((p) => p.id)).toEqual(["mint"]);
    expect(getCharacterPack("unknown-id").id).toBe("mint");
  });

  it("produces non-empty hit-masks for vector Mint", () => {
    const mintVector = getCharacterPack("mint");
    expect(mintVector.pixelArt).toBe(false);
    expect(mintVector.hitMask(1, 0, 0).length).toBeGreaterThanOrEqual(4);
  });

  it("resolves fallback moods when a mood is unsupported", () => {
    expect(resolveMood("warning", ["idle", "nag"])).toBe("nag");
    expect(resolveMood("warning", ["idle"])).toBe("idle");
  });
});
