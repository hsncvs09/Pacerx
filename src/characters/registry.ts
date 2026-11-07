import catalogData from "./catalog.json";
import { pack as mintPack } from "./mint/pack";
import type { CharacterPack } from "./types";

interface CatalogItem {
  id: string;
  name: string;
}

const globModules = import.meta.glob<{ pack: CharacterPack }>("./*/pack.ts", {
  eager: true,
});

const packMap = new Map<string, CharacterPack>();
for (const mod of Object.values(globModules)) {
  if (mod?.pack) {
    packMap.set(mod.pack.id, mod.pack);
  }
}

if (!packMap.has("mint")) {
  packMap.set("mint", mintPack);
}

const catalog: CatalogItem[] = catalogData;

// Validate at startup that every catalog entry matches a registered CharacterPack
for (const entry of catalog) {
  if (!packMap.has(entry.id)) {
    throw new Error(
      `Character catalog entry "${entry.id}" has no registered CharacterPack`,
    );
  }
}

export function getCharacterPack(id: string): CharacterPack {
  return packMap.get(id) ?? mintPack;
}

export function getAllCharacterPacks(): CharacterPack[] {
  return catalog.map((item) => getCharacterPack(item.id));
}

export function getCatalog(): ReadonlyArray<CatalogItem> {
  return catalog;
}
