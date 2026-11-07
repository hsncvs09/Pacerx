export interface CompiledPath {
  color: string;
  d: string;
}

export function isTransparentChar(ch: string): boolean {
  return ch === "." || ch === " ";
}

/**
 * Composites multiple ASCII sprite layers (from bottom to top) into a single grid.
 * Non-transparent characters in upper layers overwrite lower layers.
 */
export function compositeLayers(
  layers: ReadonlyArray<ReadonlyArray<string> | null | undefined>,
): string[] {
  const valid = layers.filter(
    (l): l is ReadonlyArray<string> => Array.isArray(l) && l.length > 0,
  );
  if (valid.length === 0) return [];

  const height = valid[0].length;
  const width = valid[0][0]?.length ?? 0;
  const grid: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "."),
  );

  for (const layer of valid) {
    for (let y = 0; y < Math.min(height, layer.length); y++) {
      const row = layer[y];
      for (let x = 0; x < Math.min(width, row.length); x++) {
        const ch = row[x];
        if (!isTransparentChar(ch)) {
          grid[y][x] = ch;
        }
      }
    }
  }

  return grid.map((r) => r.join(""));
}

/**
 * Compiles an ASCII pixel-art grid and palette into one SVG `<path d>` per color
 * using horizontal run-length encoding (`M x y h n v1 h-n z`).
 */
export function compileSprite(
  rows: ReadonlyArray<string>,
  palette: Readonly<Record<string, string>>,
): CompiledPath[] {
  const pathsByColor = new Map<string, string[]>();

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (isTransparentChar(ch)) {
        x++;
        continue;
      }

      const color = palette[ch];
      if (!color) {
        throw new Error(`Unknown palette key "${ch}" at (${x}, ${y})`);
      }

      let runLen = 1;
      while (x + runLen < row.length && row[x + runLen] === ch) {
        runLen++;
      }

      let list = pathsByColor.get(color);
      if (!list) {
        list = [];
        pathsByColor.set(color, list);
      }
      list.push(`M${x} ${y}h${runLen}v1h-${runLen}z`);
      x += runLen;
    }
  }

  const result: CompiledPath[] = [];
  for (const [color, segments] of pathsByColor.entries()) {
    result.push({ color, d: segments.join("") });
  }
  return result;
}

export function compileLayeredSprite(
  layers: ReadonlyArray<ReadonlyArray<string> | null | undefined>,
  palette: Readonly<Record<string, string>>,
): CompiledPath[] {
  return compileSprite(compositeLayers(layers), palette);
}
