"use client";

import { useEffect, useState } from "react";
import { formatJapaneseDate } from "@/lib/dates";
import { getAllViews } from "@/lib/db";
import { summarizeViews, type DaySummary, type WordSummary } from "@/lib/summary";
import { wordsById } from "@/lib/words";

export function HistoryScreen() {
  const [days, setDays] = useState<DaySummary[] | null>(null);
  const [words, setWords] = useState<WordSummary[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function load() {
      getAllViews()
        .then((views) => {
          if (cancelled) return;
          const summary = summarizeViews(views);
          setDays(summary.days);
          setWords(summary.words);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }

    load();
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-full items-center px-5">
        <p>この端末では記録を読み出せません。</p>
      </div>
    );
  }

  if (!days) {
    return (
      <div className="flex min-h-full items-center px-5">
        <p className="text-muted">読み込み中</p>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex min-h-full items-center px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <p className="text-xl leading-relaxed">まだ記録がありません。</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-8">
      <h1 className="text-sm text-muted">履歴</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">日ごと</h2>
        <ul className="mt-2">
          {days.map((day) => (
            <li
              key={day.date}
              className="flex items-baseline justify-between gap-4 border-b border-line py-3"
            >
              <span>{formatJapaneseDate(day.date)}</span>
              <span className="shrink-0 text-sm text-muted tabular-nums">
                種類 {day.uniqueWords} · 回数 {day.total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">単語ごと</h2>
        <ul className="mt-2">
          {words.map((entry) => {
            const word = wordsById.get(entry.wordId);
            return (
              <li key={entry.wordId} className="border-b border-line py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span lang="es" className="text-lg">
                    {word?.spanish ?? entry.wordId}
                  </span>
                  <span className="shrink-0 text-sm text-muted tabular-nums">
                    {entry.total}回
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3 text-sm text-muted">
                  <span>{word?.japanese ?? ""}</span>
                  <span className="shrink-0">
                    最終 {formatJapaneseDate(entry.lastDate)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
