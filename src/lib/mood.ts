import type {
  BubbleContent,
  InteractionState,
  Mood,
  Snapshot,
} from "./types";

export const POKE_DURATION_MS = 1000;
export const CELEBRATE_DURATION_MS = 3000;

export function formatMmSs(secs: number): string {
  const clamped = Math.max(0, Math.floor(secs));
  const mm = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const ss = (clamped % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * Pure priority-ordered mood derivation (matches table in implementation plan):
 * 1. dragged
 * 2. poked (last 1s)
 * 3. celebrate (3s after FocusCompleted)
 * 4. nag (phase === "nag")
 * 5. sleeping (paused)
 * 6. warning (Break && input_recent)
 * 7. walking (Break)
 * 8. focus_sad (Focus && sad)
 * 9. focus (Focus)
 * 10. idle (Idle)
 */
export function deriveMood(
  snapshot: Snapshot,
  ix: InteractionState,
  now: number,
): Mood {
  if (ix.dragging) return "dragged";
  if (now < ix.pokedUntil) return "poked";
  if (now < ix.celebrateUntil) return "celebrate";
  if (snapshot.phase === "nag") return "nag";
  if (snapshot.paused) return "sleeping";
  if (snapshot.phase === "break" && snapshot.input_recent) return "warning";
  if (snapshot.phase === "break") return "walking";
  if (snapshot.phase === "focus" && snapshot.sad) return "focus_sad";
  if (snapshot.phase === "focus") return "focus";
  return "idle";
}

export function bubbleFor(
  mood: Mood,
  snapshot: Snapshot,
): BubbleContent | null {
  switch (mood) {
    case "poked": {
      const timeStr = formatMmSs(snapshot.remaining_secs);
      if (snapshot.phase === "idle") {
        return { text: `Hazır · ${timeStr}` };
      }
      if (snapshot.phase === "break") {
        return { text: `Mola · ${timeStr} kaldı` };
      }
      return { text: `Kalan: ${timeStr}` };
    }
    case "nag":
      return {
        text: "Lütfen 5 dk yürü 🥺",
        actions: [
          {
            label: "Tamam, yürüyorum",
            command: "accept_break",
            primary: true,
          },
          {
            label: "Yine de çalış",
            command: "continue_anyway",
          },
        ],
      };
    case "celebrate":
    case "walking":
      return {
        text: "Mola zamanı! 5 dk yürü 🚶",
        actions: [
          {
            label: "Molayı Atla",
            command: "skip_break",
          },
        ],
      };
    case "warning":
      return {
        text: "Hey, masadan kalk! 🚶",
        actions: [
          {
            label: "Molayı Atla",
            command: "skip_break",
          },
        ],
      };
    case "idle":
      return { text: "Başlayalım mı? (çift tıkla)" };
    default:
      return null;
  }
}
