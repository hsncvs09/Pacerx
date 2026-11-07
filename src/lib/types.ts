export type Phase = "idle" | "focus" | "break" | "nag";

export type Command =
  | "start"
  | "toggle_pause"
  | "skip_break"
  | "accept_break"
  | "continue_anyway"
  | "reset";

export type DomainEvent =
  | { type: "phase_changed"; from: Phase; to: Phase }
  | { type: "focus_completed" }
  | { type: "break_completed" }
  | { type: "break_skipped" };

export interface Snapshot {
  phase: Phase;
  remaining_secs: number;
  total_secs: number;
  paused: boolean;
  sad: boolean;
  input_recent: boolean;
}

export interface DailyStats {
  focus_completed: number;
  breaks_completed: number;
  breaks_skipped: number;
}

export interface Settings {
  version: number;
  character_id: string;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Mood =
  | "dragged"
  | "poked"
  | "celebrate"
  | "nag"
  | "sleeping"
  | "warning"
  | "walking"
  | "focus_sad"
  | "focus"
  | "idle";

export interface InteractionState {
  dragging: boolean;
  pokedUntil: number;
  celebrateUntil: number;
}

export interface BubbleAction {
  label: string;
  command: Command;
  primary?: boolean;
}

export interface BubbleContent {
  text: string;
  actions?: BubbleAction[];
}
