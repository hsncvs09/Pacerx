export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 40;
export const SPRITE_SCALE = 5;

export type FaceId =
  | "happy"
  | "blink"
  | "sad"
  | "tear"
  | "sleep"
  | "squint"
  | "angry"
  | "xx";

export type ArmId =
  | "rest"
  | "wave1"
  | "wave2"
  | "hips"
  | "swing1"
  | "swing2"
  | "holdCard"
  | "thumbsUp";

export type LegId = "stand" | "walk1" | "walk2" | "dangle";

export type EffectId = "none" | "zzz" | "confetti";

function emptyGrid(): string[] {
  return Array.from({ length: SPRITE_HEIGHT }, () => ".".repeat(SPRITE_WIDTH));
}

function withPatch(startY: number, rows: string[]): string[] {
  const g = emptyGrid();
  for (let i = 0; i < rows.length; i++) {
    const y = startY + i;
    if (y >= 0 && y < SPRITE_HEIGHT) {
      if (rows[i].length !== SPRITE_WIDTH) {
        throw new Error(
          `Row ${i} at y=${y} has length ${rows[i].length}, expected ${SPRITE_WIDTH}`,
        );
      }
      g[y] = rows[i];
    }
  }
  return g;
}

/**
 * 32x40 handheld console body:
 * K = dark outline / features
 * L = top-left highlight
 * B = primary console body
 * U = lower console body (same as B for single-tone, darker for two-tone like Retro)
 * H = body shadow
 * S = screen background
 * E = screen top inner shadow
 * D = D-pad
 * A = A button
 * b = B button
 * G = select/start pill slots
 */
export const body: string[] = withPatch(4, [
  // y = 4..31 (28 rows)
  //01234567890123456789012345678901
  ".......KKKKKKKKKKKKKKKKKK.......", // 4
  "......KLLLLLLLLLLLLLLLLLLK......", // 5
  ".....KLBBBBBBBBBBBBBBBBBBHK.....", // 6
  ".....KLBKKKKKKKKKKKKKKKKBHK.....", // 7
  ".....KLBKEEEEEEEEEEEEEESBHK.....", // 8
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 9
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 10
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 11
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 12
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 13
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 14
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 15
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 16
  ".....KLBKSSSSSSSSSSSSSSSBHK.....", // 17
  ".....KLBKKKKKKKKKKKKKKKKBHK.....", // 18
  ".....KLBBBBBBBBBBBBBBBBBBHK.....", // 19
  ".....KLUUUUUUUUUUUUUUUUUUHK.....", // 20
  ".....KLUU..KKK....UUUUAAUHK.....", // 21
  ".....KLUU..KDK....UUUUAAUHK.....", // 22
  ".....KLUUKKKDKKK..UbbUUUUHK.....", // 23
  ".....KLUUKDDDDDK..UbbUUUUHK.....", // 24
  ".....KLUUKKKDKKK..UUUUUUUHK.....", // 25
  ".....KLUU..KDK....UUUUUUUHK.....", // 26
  ".....KLUU..KKK.GG.GG.K.K.HK.....", // 27
  ".....KLUUUUUUUUUUUUU.K.K.HK.....", // 28
  ".....KLUUUUUUUUUUUUUUUUUUHK.....", // 29
  "......KHHHHHHHHHHHHHHHHHHK......", // 30
  ".......KKKKKKKKKKKKKKKKKK.......", // 31
]);

export const faces: Record<FaceId, string[]> = {
  happy: withPatch(9, [
    // y = 9..16 (inside screen x=9..22)
    ".........SSSSSSSSSSSSSS.........", // 9
    ".........SSKKSSSSSSKKSS.........", // 10
    ".........SSKKSSSSSSKKSS.........", // 11
    ".........SSSSSSSSSSSSSS.........", // 12
    ".........CCSSKSSSSKSSCC.........", // 13
    ".........CCSSSKKKKSSSCC.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  blink: withPatch(9, [
    ".........SSSSSSSSSSSSSS.........", // 9
    ".........SSSSSSSSSSSSSS.........", // 10
    ".........SSKKKSSSSKKKSS.........", // 11
    ".........SSSSSSSSSSSSSS.........", // 12
    ".........CCSSKSSSSKSSCC.........", // 13
    ".........CCSSSKKKKSSSCC.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  sad: withPatch(9, [
    ".........SKKSSSSSSSSKKS.........", // 9
    ".........SSSKKSSSSKKSSS.........", // 10
    ".........SSKKSSSSSSKKSS.........", // 11
    ".........SSSSSSSSSSSSSS.........", // 12
    ".........SSSSSKKKKSSSSS.........", // 13
    ".........SSSSKSSSSKSSSS.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  tear: withPatch(9, [
    ".........SKKSSSSSSSSKKS.........", // 9
    ".........SSKKSSSSSSKKSS.........", // 10
    ".........SSKKSSSSSSKKSS.........", // 11
    ".........SSTTSSSSSSTTSS.........", // 12
    ".........SSTTSKKKKSTTSS.........", // 13
    ".........SSTTKSSSSKTTSS.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  sleep: withPatch(8, [
    ".........ZZZZZZZZZZZZZZ.........", // 8
    ".........ZZZZZZZZZZZZZZ.........", // 9
    ".........ZZZZZZZZZZZZZZ.........", // 10
    ".........ZZKKKZZZZKKKZZ.........", // 11
    ".........ZZZZZZZZZZZZZZ.........", // 12
    ".........ZZZZZZKKZZZZZZ.........", // 13
    ".........ZZZZZZZZZZZZZZ.........", // 14
    ".........ZZZZZZZZZZZZZZ.........", // 15
    ".........ZZZZZZZZZZZZZZ.........", // 16
    ".........ZZZZZZZZZZZZZZ.........", // 17
  ]),
  squint: withPatch(9, [
    ".........SSSSSSSSSSSSSS.........", // 9
    ".........SSKSSSSSSSSKSS.........", // 10
    ".........SK.KSSSSSSK.KS.........", // 11
    ".........SSSSSSSSSSSSSS.........", // 12
    ".........CCSSKKKKKKSSCC.........", // 13
    ".........CCSSSKKKKSSSCC.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  angry: withPatch(9, [
    ".........SSKKSSSSSSKKSS.........", // 9
    ".........SSSKKSSSSKKSSS.........", // 10
    ".........SSKKSSSSSSKKSS.........", // 11
    ".........SSSSSSSSSSSSSS.........", // 12
    ".........SSSSKKKKKKSSSS.........", // 13
    ".........SSSKSSSSSSKSSS.........", // 14
    ".........SSSSSSSSSSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
  xx: withPatch(9, [
    ".........SKSSSSSSSSSSKS.........", // 9
    ".........SSKSSSSSSSSKSS.........", // 10
    ".........SSSKSSSSSSKSSS.........", // 11
    ".........SSKSSSSSSSSKSS.........", // 12
    ".........SKSSSKKKKSSKS..........", // 13
    ".........SSSSSK..KSSSSS.........", // 14
    ".........SSSSSKKKKSSSSS.........", // 15
    ".........SSSSSSSSSSSSSS.........", // 16
  ]),
};

export const arms: Record<ArmId, string[]> = {
  rest: withPatch(18, [
    // y = 18..26
    "...KK......................KK...", // 18
    "..KBBK....................KBBK..", // 19
    "..KBBK....................KBBK..", // 20
    "..KBBK....................KBBK..", // 21
    "..KBBK....................KBBK..", // 22
    "..KBBK....................KBBK..", // 23
    "..KHHK....................KHHK..", // 24
    "...KK......................KK...", // 25
  ]),
  wave1: withPatch(11, [
    // y = 11..25 (right arm raised high)
    "............................KK..", // 11
    "...........................KBBK.", // 12
    "...........................KBBK.", // 13
    "...........................KBBK.", // 14
    "..........................KBBK..", // 15
    "..........................KBBK..", // 16
    "..........................KHHK..", // 17
    "...KK.....................KK....", // 18
    "..KBBK..........................", // 19
    "..KBBK..........................", // 20
    "..KBBK..........................", // 21
    "..KBBK..........................", // 22
    "..KBBK..........................", // 23
    "..KHHK..........................", // 24
    "...KK...........................", // 25
  ]),
  wave2: withPatch(12, [
    // y = 12..25 (right arm tilted out)
    ".............................KK.", // 12
    "............................KBBK", // 13
    "............................KBBK", // 14
    "...........................KBBK.", // 15
    "..........................KBBK..", // 16
    "..........................KHHK..", // 17
    "...KK.....................KK....", // 18
    "..KBBK..........................", // 19
    "..KBBK..........................", // 20
    "..KBBK..........................", // 21
    "..KBBK..........................", // 22
    "..KBBK..........................", // 23
    "..KHHK..........................", // 24
    "...KK...........................", // 25
  ]),
  hips: withPatch(18, [
    // y = 18..25 (hands on hips)
    "...KK......................KK...", // 18
    "..KBBK....................KBBK..", // 19
    ".KBBK......................KBBK.", // 20
    ".KBBK......................KBBK.", // 21
    "..KBBK....................KBBK..", // 22
    "...KBBK..................KBBK...", // 23
    "....KK....................KK....", // 24
  ]),
  swing1: withPatch(16, [
    // y = 16..26 (walking frame 1)
    "..KK............................", // 16
    ".KBBK...........................", // 17
    ".KBBK......................KK...", // 18
    "..KBBK....................KBBK..", // 19
    "..KBBK....................KBBK..", // 20
    "...KK.....................KBBK..", // 21
    "...........................KBBK.", // 22
    "...........................KHHK.", // 23
    "............................KK..", // 24
  ]),
  swing2: withPatch(16, [
    // y = 16..26 (walking frame 2)
    "............................KK..", // 16
    "...........................KBBK.", // 17
    "...KK......................KBBK.", // 18
    "..KBBK....................KBBK..", // 19
    "..KBBK....................KBBK..", // 20
    "..KBBK.....................KK...", // 21
    ".KBBK...........................", // 22
    ".KHHK...........................", // 23
    "..KK............................", // 24
  ]),
  holdCard: withPatch(13, [
    // y = 13..25 (left hand holds up white note card x=0..7, y=13..21)
    "KKKKKKKK........................", // 13
    "KWWWWWWK........................", // 14
    "KWMMMMWK........................", // 15
    "KWWWWWWK........................", // 16
    "KWMMWWWK........................", // 17
    "KWWWWWWK...................KK...", // 18
    "KWWWWWWK..................KBBK..", // 19
    "KKKKKKKK..................KBBK..", // 20
    "..KBBK....................KBBK..", // 21
    "..KBBK....................KBBK..", // 22
    "..KHHK....................KBBK..", // 23
    "...KK.....................KHHK..", // 24
    "...........................KK...", // 25
  ]),
  thumbsUp: withPatch(12, [
    // y = 12..24 (both arms celebrating, right hand thumbs-up)
    "............................KK..", // 12
    "..KK.......................KYYK.", // 13
    ".KBBK.....................KYYYK.", // 14
    ".KBBK.....................KBBBK.", // 15
    "..KBBK....................KBBK..", // 16
    "..KBBK....................KBBK..", // 17
    "...KBBK..................KBBK...", // 18
    "....KK....................KK....", // 19
  ]),
};

export const legs: Record<LegId, string[]> = {
  stand: withPatch(32, [
    // y = 32..37
    "..........KBBK....KBBK..........", // 32
    "..........KBBK....KBBK..........", // 33
    "..........KBBK....KBBK..........", // 34
    "..........KHHK....KHHK..........", // 35
    ".........KKKKK....KKKKK.........", // 36
    ".........KKKKK....KKKKK.........", // 37
  ]),
  walk1: withPatch(32, [
    // y = 32..38 (left leg raised, right leg extended)
    ".........KBBK.....KBBK..........", // 32
    ".........KBBK.....KBBK..........", // 33
    "........KKKKK.....KBBK..........", // 34
    "........KKKKK.....KHHK..........", // 35
    "..................KKKKK.........", // 36
    "..................KKKKK.........", // 37
  ]),
  walk2: withPatch(32, [
    // y = 32..38 (left leg extended, right leg raised)
    "..........KBBK.....KBBK.........", // 32
    "..........KBBK.....KBBK.........", // 33
    "..........KBBK.....KKKKK........", // 34
    "..........KHHK.....KKKKK........", // 35
    ".........KKKKK..................", // 36
    ".........KKKKK..................", // 37
  ]),
  dangle: withPatch(32, [
    // y = 32..38 (dangling legs when dragged)
    "..........KBBK....KBBK..........", // 32
    ".........KBBK......KBBK.........", // 33
    ".........KBBK......KBBK.........", // 34
    "..........KHHK....KHHK..........", // 35
    "..........KKKK....KKKK..........", // 36
  ]),
};

export const effects: Record<EffectId, string[]> = {
  none: emptyGrid(),
  zzz: withPatch(0, [
    "..........................TTTT..", // 0
    "............................TT..", // 1
    "...........................TT...", // 2
    "..........................TTTT..", // 3
    ".......................TTT......", // 4
    "........................TT......", // 5
    ".......................TTT......", // 6
  ]),
  confetti: withPatch(0, [
    "...AA......YY......CC......bb...", // 0
    ".......TT..............AA.......", // 1
    "..bb........CC....YY........TT..", // 2
    ".....YY..................CC.....", // 3
  ]),
};

/**
 * Returns all structural layers that can receive pointer events for hit-mask computation.
 */
export function consoleHitMaskLayers(includeCard = true): string[][] {
  const list: string[][] = [
    body,
    arms.rest,
    arms.wave1,
    arms.wave2,
    arms.hips,
    arms.swing1,
    arms.swing2,
    arms.thumbsUp,
    legs.stand,
    legs.walk1,
    legs.walk2,
    legs.dangle,
  ];
  if (includeCard) {
    list.push(arms.holdCard);
  }
  return list;
}
