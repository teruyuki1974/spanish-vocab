import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { addDays, tokyoDate } from "./dates";
import { applyProgress, buildQueue, cardAt } from "./queue";
import { summarizeViews } from "./summary";
import type { Progress } from "./types";

function daysFrom(start: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

function runDays(wordIds: string[], dates: string[]) {
  const progress = new Map<string, Progress>();
  const queues = dates.map((today) => {
    const items = buildQueue({ wordIds, progressById: progress, today });
    for (const item of items) {
      const next = applyProgress(
        progress.get(item.wordId),
        item.kind,
        today,
        item.wordId,
      );
      if (next) progress.set(item.wordId, next);
    }
    return { today, items };
  });
  return { progress, queues };
}

test("日付は日本時間で切り、暦日を足せる", () => {
  assert.equal(tokyoDate(new Date("2026-10-20T15:00:00.000Z")), "2026-10-21");
  assert.equal(tokyoDate(new Date("2026-10-20T14:59:00.000Z")), "2026-10-20");
  assert.equal(addDays("2026-01-01", 30), "2026-01-31");
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("初見の日を0日目として1・3・7・30日後に進み、30日後でキューから外れる", () => {
  const introduced = applyProgress(undefined, "new", "2026-01-01", "w001");
  assert.equal(introduced?.firstSeenDate, "2026-01-01");
  assert.equal(introduced?.nextInterval, 1);
  assert.equal(introduced?.nextDueDate, "2026-01-02");

  const late = applyProgress(introduced, "review", "2026-01-05", "w001");
  assert.equal(late?.nextInterval, 3);
  assert.equal(late?.nextDueDate, "2026-01-04");

  const day7 = applyProgress(
    { ...late!, nextDueDate: "2026-01-04" },
    "review",
    "2026-01-04",
    "w001",
  );
  assert.equal(day7?.nextInterval, 7);
  assert.equal(day7?.nextDueDate, "2026-01-08");

  const day30 = applyProgress(day7, "review", "2026-01-08", "w001");
  assert.equal(day30?.nextInterval, 30);
  assert.equal(day30?.nextDueDate, "2026-01-31");

  const done = applyProgress(day30, "review", "2026-01-31", "w001");
  assert.equal(done?.nextInterval, null);
  assert.equal(done?.nextDueDate, null);

  const second = applyProgress(introduced, "second", "2026-01-01", "w001");
  assert.equal(second, introduced);
});

test("毎日続けると導入は1日20語、再表示は初見からの間隔、30日後の翌日は出ない", () => {
  const wordIds = Array.from({ length: 40 }, (_, index) =>
    `w${String(index + 1).padStart(3, "0")}`,
  );
  const dates = daysFrom("2026-01-01", 40);
  const { progress, queues } = runDays(wordIds, dates);
  const byDate = new Map(queues.map((day) => [day.today, day.items]));

  for (const items of byDate.values()) {
    assert.ok(items.length <= 100);
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.wordId, (counts.get(item.wordId) ?? 0) + 1);
    }
    for (const [wordId, count] of counts) {
      assert.ok(count <= 2, wordId);
      if (count === 2) {
        const kinds = items
          .filter((item) => item.wordId === wordId)
          .map((item) => item.kind);
        assert.deepEqual(kinds, ["new", "second"]);
      }
    }
    assert.ok(items.filter((item) => item.kind === "new").length <= 20);
  }

  const day1 = byDate.get("2026-01-01")!;
  assert.equal(day1.length, 40);
  assert.equal(day1.filter((item) => item.kind === "new").length, 20);
  assert.equal(day1.filter((item) => item.kind === "second").length, 20);
  assert.deepEqual(
    day1.filter((item) => item.kind === "new").map((item) => item.wordId),
    wordIds.slice(0, 20),
  );

  const day2 = byDate.get("2026-01-02")!;
  assert.equal(day2.filter((item) => item.kind === "review").length, 20);
  assert.equal(day2.filter((item) => item.kind === "new").length, 20);
  assert.equal(day2.filter((item) => item.kind === "second").length, 20);

  assert.equal(byDate.get("2026-01-03")!.length, 20);
  assert.ok(byDate.get("2026-01-03")!.every((item) => item.kind === "review"));
  assert.equal(byDate.get("2026-01-04")!.length, 20);
  assert.equal(byDate.get("2026-01-08")!.length, 20);
  assert.equal(byDate.get("2026-01-31")!.length, 20);
  assert.equal(progress.get("w001")?.nextDueDate, null);

  assert.equal(byDate.get("2026-02-01")!.length, 20);
  assert.equal(progress.get("w021")?.nextDueDate, null);
  assert.equal(byDate.get("2026-02-02")!.length, 0);
  assert.equal(
    [...progress.values()].every((item) => item.nextDueDate === null),
    true,
  );
});

test("1日目を休むと、過ぎた再表示を優先して段は一つだけ進む", () => {
  const wordIds = Array.from({ length: 40 }, (_, index) =>
    `w${String(index + 1).padStart(3, "0")}`,
  );
  const { progress, queues } = runDays(wordIds, ["2026-01-01", "2026-01-03"]);
  const skipped = queues[1].items;
  assert.equal(skipped.filter((item) => item.kind === "review").length, 20);
  assert.equal(skipped.filter((item) => item.kind === "new").length, 20);
  assert.equal(progress.get("w001")?.nextInterval, 3);
  assert.equal(progress.get("w001")?.nextDueDate, "2026-01-04");
});

test("期限を過ぎた再表示が100枚を超える日は、古いものから100枚で新規は出さない", () => {
  const wordIds = Array.from({ length: 130 }, (_, index) => `w${index}`);
  const progress = new Map<string, Progress>();
  for (let index = 0; index < 120; index += 1) {
    progress.set(wordIds[index], {
      wordId: wordIds[index],
      firstSeenDate: "2025-01-01",
      nextInterval: 1,
      nextDueDate: addDays("2026-01-01", -(120 - index)),
    });
  }

  const queue = buildQueue({
    wordIds,
    progressById: progress,
    today: "2026-01-01",
  });
  assert.equal(queue.length, 100);
  assert.ok(queue.every((item) => item.kind === "review"));
  assert.equal(queue[0].wordId, "w0");
  assert.equal(queue[99].wordId, "w99");
});

test("同じ単語を1日に2回開くと、累計は2、種類数は1、合計回数は2", () => {
  const summary = summarizeViews([
    { wordId: "w001", tokyoDate: "2026-01-01" },
    { wordId: "w001", tokyoDate: "2026-01-01" },
    { wordId: "w002", tokyoDate: "2026-01-02" },
  ]);

  assert.deepEqual(summary.days, [
    { date: "2026-01-02", uniqueWords: 1, total: 1 },
    { date: "2026-01-01", uniqueWords: 1, total: 2 },
  ]);
  assert.deepEqual(summary.words, [
    { wordId: "w002", total: 1, lastDate: "2026-01-02" },
    { wordId: "w001", total: 2, lastDate: "2026-01-01" },
  ]);
});

test("一日の予定を見終えたあとは、その日に表示した単語を順に繰り返す", () => {
  const items = [
    { wordId: "w001", kind: "new" as const },
    { wordId: "w002", kind: "new" as const },
    { wordId: "w001", kind: "second" as const },
    { wordId: "w002", kind: "second" as const },
  ];

  assert.equal(cardAt(items, 0)?.kind, "new");
  assert.deepEqual(cardAt(items, 4), { wordId: "w001", kind: "second" });
  assert.deepEqual(cardAt(items, 5), { wordId: "w002", kind: "second" });
  assert.deepEqual(cardAt(items, 6), { wordId: "w001", kind: "second" });

  const introduced = applyProgress(undefined, "new", "2026-01-01", "w001");
  assert.equal(applyProgress(introduced, "second", "2026-01-01", "w001"), introduced);
});

test("見本のチャンクは単語を含み、IDは重複しない", () => {
  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    "../data/words.json",
  );
  const words = JSON.parse(readFileSync(path, "utf8")) as {
    id: string;
    spanish: string;
    chunk: string;
    japanese: string;
  }[];
  assert.equal(words.length, 3500);
  const ids = new Set<string>();
  for (const word of words) {
    assert.equal(ids.has(word.id), false);
    ids.add(word.id);
    assert.ok(word.spanish.length > 0);
    assert.ok(word.chunk.toLowerCase().includes(word.spanish.toLowerCase()));
    assert.ok(word.japanese.length > 0);
  }
});
