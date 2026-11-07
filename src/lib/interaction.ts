export const DRAG_THRESHOLD_PX = 4;
export const DOUBLE_CLICK_WINDOW_MS = 250;

export interface PointerGestureState {
  pointerDown: boolean;
  startX: number;
  startY: number;
  dragging: boolean;
  lastClickAt: number | null;
}

export type GestureInput =
  | { type: "down"; x: number; y: number; now: number }
  | { type: "move"; x: number; y: number; now: number }
  | { type: "up"; x: number; y: number; now: number }
  | { type: "cancel"; now: number };

export type GestureAction =
  | "none"
  | "single_click"
  | "double_click"
  | "drag_start"
  | "drag_end";

export interface GestureStep {
  state: PointerGestureState;
  action: GestureAction;
}

export function initialGestureState(): PointerGestureState {
  return {
    pointerDown: false,
    startX: 0,
    startY: 0,
    dragging: false,
    lastClickAt: null,
  };
}

/**
 * Pure function that discriminates single click (poke), double click (<= 250ms),
 * and drag (>= 4px movement while pointer is down).
 */
export function stepGesture(
  state: PointerGestureState,
  input: GestureInput,
): GestureStep {
  switch (input.type) {
    case "down": {
      return {
        state: {
          ...state,
          pointerDown: true,
          startX: input.x,
          startY: input.y,
          dragging: false,
        },
        action: "none",
      };
    }

    case "move": {
      if (!state.pointerDown || state.dragging) {
        return { state, action: "none" };
      }
      const dx = input.x - state.startX;
      const dy = input.y - state.startY;
      if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        return {
          state: {
            ...state,
            dragging: true,
            lastClickAt: null,
          },
          action: "drag_start",
        };
      }
      return { state, action: "none" };
    }

    case "up": {
      if (!state.pointerDown) {
        return { state, action: "none" };
      }
      if (state.dragging) {
        return {
          state: {
            ...state,
            pointerDown: false,
            dragging: false,
          },
          action: "drag_end",
        };
      }

      const isDouble =
        state.lastClickAt !== null &&
        input.now - state.lastClickAt <= DOUBLE_CLICK_WINDOW_MS;

      if (isDouble) {
        return {
          state: {
            ...state,
            pointerDown: false,
            lastClickAt: null,
          },
          action: "double_click",
        };
      }

      return {
        state: {
          ...state,
          pointerDown: false,
          lastClickAt: input.now,
        },
        action: "single_click",
      };
    }

    case "cancel": {
      const wasDragging = state.dragging;
      return {
        state: {
          ...state,
          pointerDown: false,
          dragging: false,
        },
        action: wasDragging ? "drag_end" : "none",
      };
    }
  }
}
