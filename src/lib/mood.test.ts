import { describe, expect, it } from "vitest";
import { bubbleFor, deriveMood, formatMmSs } from "./mood";
import type { InteractionState, Snapshot } from "./types";

function baseSnap(overrides: Partial<Snapshot> = {}): Snapshot {
  return {
    phase: "idle",
    remaining_secs: 1500,
    total_secs: 1500,
    paused: false,
    sad: false,
    input_recent: false,
    ...overrides,
  };
}

function baseIx(overrides: Partial<InteractionState> = {}): InteractionState {
  return {
    dragging: false,
    pokedUntil: 0,
    celebrateUntil: 0,
    ...overrides,
  };
}

describe("deriveMood priority table", () => {
  it("1. dragged has highest priority over all states", () => {
    const snap = baseSnap({ phase: "nag", paused: true });
    const ix = baseIx({
      dragging: true,
      pokedUntil: 2000,
      celebrateUntil: 5000,
    });
    expect(deriveMood(snap, ix, 1000)).toBe("dragged");
  });

  it("2. poked beats celebrate, nag, sleeping, warning, etc.", () => {
    const snap = baseSnap({ phase: "nag", paused: true });
    const ix = baseIx({ pokedUntil: 2000, celebrateUntil: 5000 });
    expect(deriveMood(snap, ix, 1500)).toBe("poked");
  });

  it("3. celebrate beats nag and phase states", () => {
    const snap = baseSnap({ phase: "break", input_recent: true });
    const ix = baseIx({ celebrateUntil: 4000 });
    expect(deriveMood(snap, ix, 2000)).toBe("celebrate");
  });

  it("4. nag phase yields nag mood", () => {
    const snap = baseSnap({ phase: "nag" });
    expect(deriveMood(snap, baseIx(), 1000)).toBe("nag");
  });

  it("5. paused yields sleeping mood", () => {
    const snap = baseSnap({ phase: "focus", paused: true, sad: true });
    expect(deriveMood(snap, baseIx(), 1000)).toBe("sleeping");
  });

  it("6 & 7. break with input_recent yields warning, otherwise walking", () => {
    expect(
      deriveMood(
        baseSnap({ phase: "break", input_recent: true }),
        baseIx(),
        1000,
      ),
    ).toBe("warning");
    expect(
      deriveMood(
        baseSnap({ phase: "break", input_recent: false }),
        baseIx(),
        1000,
      ),
    ).toBe("walking");
  });

  it("8 & 9. focus with sad yields focus_sad, otherwise focus", () => {
    expect(
      deriveMood(baseSnap({ phase: "focus", sad: true }), baseIx(), 1000),
    ).toBe("focus_sad");
    expect(
      deriveMood(baseSnap({ phase: "focus", sad: false }), baseIx(), 1000),
    ).toBe("focus");
  });

  it("10. idle yields idle mood", () => {
    expect(deriveMood(baseSnap({ phase: "idle" }), baseIx(), 1000)).toBe(
      "idle",
    );
  });
});

describe("bubbleFor and formatMmSs", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatMmSs(1500)).toBe("25:00");
    expect(formatMmSs(65)).toBe("01:05");
    expect(formatMmSs(0)).toBe("00:00");
  });

  it("returns appropriate bubbles for idle, poked, break states, and nag", () => {
    const snap = baseSnap({ phase: "focus", remaining_secs: 605 });
    expect(bubbleFor("idle", snap)?.text).toBe("Başlayalım mı? (çift tıkla)");
    expect(bubbleFor("poked", snap)?.text).toContain("10:05");

    const celebrateBubble = bubbleFor("celebrate", snap);
    expect(celebrateBubble?.text).toBe("Mola zamanı! 5 dk yürü 🚶");
    expect(celebrateBubble?.actions?.map((a) => a.command)).toEqual([
      "skip_break",
    ]);

    const walkingBubble = bubbleFor("walking", snap);
    expect(walkingBubble?.text).toBe("Mola zamanı! 5 dk yürü 🚶");
    expect(walkingBubble?.actions?.map((a) => a.command)).toEqual([
      "skip_break",
    ]);

    const warningBubble = bubbleFor("warning", snap);
    expect(warningBubble?.text).toBe("Hey, masadan kalk! 🚶");
    expect(warningBubble?.actions?.map((a) => a.command)).toEqual([
      "skip_break",
    ]);

    const nagBubble = bubbleFor("nag", snap);
    expect(nagBubble?.text).toBe("Lütfen 5 dk yürü 🥺");
    expect(nagBubble?.actions?.map((a) => a.command)).toEqual([
      "accept_break",
      "continue_anyway",
    ]);

    expect(bubbleFor("focus", snap)).toBeNull();
  });
});
