import type { Word } from "./types";
import raw from "@/data/words.json";

export const words: Word[] = raw;

const ids = new Set<string>();
for (const word of words) {
  if (ids.has(word.id)) {
    throw new Error(`単語IDが重複しています: ${word.id}`);
  }
  ids.add(word.id);
}

export const wordsById: ReadonlyMap<string, Word> = new Map(
  words.map((word) => [word.id, word]),
);
