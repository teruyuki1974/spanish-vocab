import { addDays } from "./dates";
import type { Progress, QueueItem, QueueKind } from "./types";

export const DAILY_LIMIT = 100;
export const NEW_LIMIT = 20;

type BuildQueueInput = {
  wordIds: readonly string[];
  progressById: ReadonlyMap<string, Progress>;
  today: string;
};

// 1日のキューを決める。
// 期限を過ぎた再表示が100枚を超える日は、期限が古いものから100枚だけにし、新規は出さない。
// それ以外は、過ぎた再表示をすべて出したあと、残りの枠で新規を最大20語、それから当日ちょうどの再表示を入れる。
// それでも余った枠は、その日の新規の当日2回目だけに使う。
export function buildQueue({
  wordIds,
  progressById,
  today,
}: BuildQueueInput): QueueItem[] {
  const catalogIndex = new Map(wordIds.map((wordId, index) => [wordId, index]));
  const due: Progress[] = [];

  for (const wordId of wordIds) {
    const progress = progressById.get(wordId);
    if (!progress?.nextDueDate || progress.nextDueDate > today) continue;
    due.push(progress);
  }

  due.sort((a, b) => {
    const dueDateOrder = a.nextDueDate!.localeCompare(b.nextDueDate!);
    if (dueDateOrder !== 0) return dueDateOrder;
    return catalogIndex.get(a.wordId)! - catalogIndex.get(b.wordId)!;
  });

  const overdue = due.filter((progress) => progress.nextDueDate! < today);
  const dueToday = due.filter((progress) => progress.nextDueDate === today);
  const unseen = wordIds.filter((wordId) => !progressById.has(wordId));

  if (overdue.length > DAILY_LIMIT) {
    return overdue.slice(0, DAILY_LIMIT).map((progress) => ({
      wordId: progress.wordId,
      kind: "review",
    }));
  }

  const roomAfterOverdue = DAILY_LIMIT - overdue.length;
  const newCount = Math.min(NEW_LIMIT, unseen.length, roomAfterOverdue);
  const dueTodayCount = Math.min(
    dueToday.length,
    roomAfterOverdue - newCount,
  );
  const reviews = [...overdue, ...dueToday.slice(0, dueTodayCount)];
  const newWordIds = unseen.slice(0, newCount);
  const secondCount = Math.min(
    newWordIds.length,
    DAILY_LIMIT - reviews.length - newWordIds.length,
  );

  return [
    ...reviews.map((progress) => ({
      wordId: progress.wordId,
      kind: "review" as const,
    })),
    ...newWordIds.map((wordId) => ({ wordId, kind: "new" as const })),
    ...newWordIds.slice(0, secondCount).map((wordId) => ({
      wordId,
      kind: "second" as const,
    })),
  ];
}

export function wordsShownInOrder(items: readonly QueueItem[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const item of items) {
    if (seen.has(item.wordId)) continue;
    seen.add(item.wordId);
    order.push(item.wordId);
  }
  return order;
}

// その日の予定枚数を超えたら、表示した単語を同じ順で繰り返す。繰り返しは段を進めない。
export function cardAt(
  items: readonly QueueItem[],
  position: number,
): QueueItem | undefined {
  if (position < 0 || items.length === 0) return undefined;
  if (position < items.length) return items[position];

  const shown = wordsShownInOrder(items);
  return {
    wordId: shown[(position - items.length) % shown.length],
    kind: "second",
  };
}

// 新規を開くと初見日を記録し、次は初見の1日後。
// 予定の再表示を開くと段を一つ進める。当日2回目は段を進めない。
// 30日後を開いたあとは次の予定を消す。
export function applyProgress(
  current: Progress | undefined,
  kind: QueueKind,
  today: string,
  wordId: string,
): Progress | undefined {
  if (kind === "second") return current;

  if (kind === "new") {
    return {
      wordId,
      firstSeenDate: today,
      nextInterval: 1,
      nextDueDate: addDays(today, 1),
    };
  }

  if (!current?.nextInterval || !current.nextDueDate) return current;

  if (current.nextInterval === 30) {
    return { ...current, nextInterval: null, nextDueDate: null };
  }

  const nextInterval =
    current.nextInterval === 1 ? 3 : current.nextInterval === 3 ? 7 : 30;

  return {
    ...current,
    nextInterval,
    nextDueDate: addDays(current.firstSeenDate, nextInterval),
  };
}
