import { describe, expect, it } from "vitest";
import {
  DOUBLE_CLICK_WINDOW_MS,
  DRAG_THRESHOLD_PX,
  initialGestureState,
  stepGesture,
} from "./interaction";

describe("interaction gesture state machine", () => {
  it("detects a single click when pointer moves less than 4px", () => {
    let s = initialGestureState();
    let res = stepGesture(s, { type: "down", x: 50, y: 50, now: 1000 });
    expect(res.action).toBe("none");
    s = res.state;

    // Slight jitter < 4px does not start drag
    res = stepGesture(s, { type: "move", x: 52, y: 51, now: 1020 });
    expect(res.action).toBe("none");
    s = res.state;

    res = stepGesture(s, { type: "up", x: 52, y: 51, now: 1050 });
    expect(res.action).toBe("single_click");
  });

  it("detects double click within 250ms window and resets click memory", () => {
    let s = initialGestureState();
    s = stepGesture(s, { type: "down", x: 10, y: 10, now: 1000 }).state;
    const firstUp = stepGesture(s, { type: "up", x: 10, y: 10, now: 1040 });
    expect(firstUp.action).toBe("single_click");
    s = firstUp.state;

    // Second tap within 250ms -> double_click
    s = stepGesture(s, { type: "down", x: 10, y: 10, now: 1200 }).state;
    const secondUp = stepGesture(s, {
      type: "up",
      x: 10,
      y: 10,
      now: 1040 + DOUBLE_CLICK_WINDOW_MS,
    });
    expect(secondUp.action).toBe("double_click");
    s = secondUp.state;

    // Third tap immediately after is treated as a fresh single_click
    s = stepGesture(s, { type: "down", x: 10, y: 10, now: 1310 }).state;
    const thirdUp = stepGesture(s, { type: "up", x: 10, y: 10, now: 1330 });
    expect(thirdUp.action).toBe("single_click");
  });

  it("treats two clicks separated by more than 250ms as two single clicks", () => {
    let s = initialGestureState();
    s = stepGesture(s, { type: "down", x: 10, y: 10, now: 1000 }).state;
    s = stepGesture(s, { type: "up", x: 10, y: 10, now: 1030 }).state;

    s = stepGesture(s, { type: "down", x: 10, y: 10, now: 1290 }).state;
    const secondUp = stepGesture(s, {
      type: "up",
      x: 10,
      y: 10,
      now: 1030 + DOUBLE_CLICK_WINDOW_MS + 1,
    });
    expect(secondUp.action).toBe("single_click");
  });

  it("triggers drag_start at >= 4px threshold and drag_end on release", () => {
    let s = initialGestureState();
    s = stepGesture(s, { type: "down", x: 20, y: 20, now: 500 }).state;

    const move1 = stepGesture(s, {
      type: "move",
      x: 20 + DRAG_THRESHOLD_PX,
      y: 20,
      now: 520,
    });
    expect(move1.action).toBe("drag_start");
    s = move1.state;

    // Subsequent moves during drag emit "none"
    const move2 = stepGesture(s, { type: "move", x: 40, y: 40, now: 540 });
    expect(move2.action).toBe("none");
    s = move2.state;

    const up = stepGesture(s, { type: "up", x: 40, y: 40, now: 580 });
    expect(up.action).toBe("drag_end");
  });
});
