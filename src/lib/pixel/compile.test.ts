import { describe, expect, it } from "vitest";
import { compileLayeredSprite, compileSprite } from "./compile";

describe("pixel sprite compiler", () => {
  it("compiles a single pixel into M x y h1 v1 h-1 z", () => {
    const rows = ["...", ".K.", "..."];
    const out = compileSprite(rows, { K: "#112233" });
    expect(out).toEqual([{ color: "#112233", d: "M1 1h1v1h-1z" }]);
  });

  it("merges contiguous horizontal pixels into a single run per row", () => {
    const rows = [".BBBB.", "..AA.."];
    const out = compileSprite(rows, { B: "#00aa88", A: "#ff3355" });
    expect(out).toEqual([
      { color: "#00aa88", d: "M1 0h4v1h-4z" },
      { color: "#ff3355", d: "M2 1h2v1h-2z" },
    ]);
  });

  it("ignores transparent characters ('.' and ' ')", () => {
    const rows = ["...   ", "  ... "];
    const out = compileSprite(rows, { K: "#000000" });
    expect(out).toEqual([]);
  });

  it("throws an error when encountering an unknown palette key", () => {
    const rows = [".X."];
    expect(() => compileSprite(rows, { K: "#000000" })).toThrow(
      /Unknown palette key "X" at \(1, 0\)/,
    );
  });

  it("composites multiple layers with upper layers overriding lower ones", () => {
    const base = ["BBBB"];
    const overlay = [".SS."];
    const out = compileLayeredSprite([base, overlay], {
      B: "#111111",
      S: "#eeeeee",
    });
    expect(out).toEqual([
      { color: "#111111", d: "M0 0h1v1h-1zM3 0h1v1h-1z" },
      { color: "#eeeeee", d: "M1 0h2v1h-2z" },
    ]);
  });
});
