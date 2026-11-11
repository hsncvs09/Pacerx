import { describe, expect, it } from "vitest";
import { getAllCharacterPacks, getCatalog, getCharacterPack } from "./registry";
import { resolveMood } from "./types";

describe("character registry", () => {
  it("registers every catalog entry and falls back to mint for unknown ids", () => {
    const catalog = getCatalog();
    const packs = getAllCharacterPacks();
    expect(packs.length).toBe(catalog.length);
    expect(packs.map((p) => p.id)).toContain("mint");
    expect(packs.map((p) => p.id)).toContain("ember");
    expect(packs.map((p) => p.id)).toContain("sprout");
    expect(packs.map((p) => p.id)).toContain("byte");
    expect(getCharacterPack("unknown-id").id).toBe("mint");
  });

  it("produces non-empty hit-masks for all registered packs", () => {
    const mintVector = getCharacterPack("mint");
    expect(mintVector.pixelArt).toBe(false);
    expect(mintVector.hitMask(1, 0, 0).length).toBeGreaterThanOrEqual(4);

    const ember = getCharacterPack("ember");
    expect(ember.pixelArt).toBe(false);
    expect(ember.hitMask(1, 0, 0).length).toBeGreaterThanOrEqual(3);

    const sprout = getCharacterPack("sprout");
    expect(sprout.pixelArt).toBe(false);
    expect(sprout.hitMask(1, 0, 0).length).toBeGreaterThanOrEqual(2);

    const byte = getCharacterPack("byte");
    expect(byte.pixelArt).toBe(false);
    expect(byte.hitMask(1, 0, 0).length).toBeGreaterThanOrEqual(3);
  });

  it("resolves fallback moods when a mood is unsupported", () => {
    expect(resolveMood("warning", ["idle", "nag"])).toBe("nag");
    expect(resolveMood("warning", ["idle"])).toBe("idle");
  });
});
