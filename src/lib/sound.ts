let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function unlockAudio(): void {
  getAudioContext();
}

function playNotes(freqs: number[], stepSec = 0.11): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime;
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start + idx * stepSec);

    const t0 = start + idx * stepSec;
    const t1 = t0 + stepSec * 0.9;
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t1);
  });
}

/** Ascending retro chime when focus completes (break starts). */
export function playChimeUp(): void {
  playNotes([523.25, 659.25, 783.99, 1046.5]);
}

/** Gentle descending/resolving chime when break completes (focus starts). */
export function playChimeDown(): void {
  playNotes([880.0, 659.25, 523.25, 659.25]);
}
