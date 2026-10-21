export type ViewedCard = {
  wordId: string;
  tokyoDate: string;
};

export type DaySummary = {
  date: string;
  uniqueWords: number;
  total: number;
};

export type WordSummary = {
  wordId: string;
  total: number;
  lastDate: string;
};

export function summarizeViews(views: readonly ViewedCard[]): {
  days: DaySummary[];
  words: WordSummary[];
} {
  const days = new Map<string, { wordIds: Set<string>; total: number }>();
  const words = new Map<string, { total: number; lastDate: string }>();

  for (const view of views) {
    const day = days.get(view.tokyoDate) ?? {
      wordIds: new Set<string>(),
      total: 0,
    };
    day.wordIds.add(view.wordId);
    day.total += 1;
    days.set(view.tokyoDate, day);

    const word = words.get(view.wordId) ?? {
      total: 0,
      lastDate: view.tokyoDate,
    };
    word.total += 1;
    if (view.tokyoDate > word.lastDate) word.lastDate = view.tokyoDate;
    words.set(view.wordId, word);
  }

  return {
    days: [...days.entries()]
      .map(([date, value]) => ({
        date,
        uniqueWords: value.wordIds.size,
        total: value.total,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    words: [...words.entries()]
      .map(([wordId, value]) => ({
        wordId,
        total: value.total,
        lastDate: value.lastDate,
      }))
      .sort((a, b) => {
        const byDate = b.lastDate.localeCompare(a.lastDate);
        if (byDate !== 0) return byDate;
        return a.wordId.localeCompare(b.wordId);
      }),
  };
}
