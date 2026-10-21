"use client";

import { useEffect, useState } from "react";
import { cardAt } from "@/lib/queue";
import { speakSpanish, stopSpeaking } from "@/lib/speak";
import { openStudySession, showNext } from "@/lib/study-session";
import type { SessionRecord } from "@/lib/types";
import { wordsById } from "@/lib/words";

const LETTER = /[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;

function ChunkText({ chunk, word }: { chunk: string; word: string }) {
  const lowerChunk = chunk.toLowerCase();
  const lowerWord = word.toLowerCase();
  let from = 0;

  while (from < lowerChunk.length) {
    const index = lowerChunk.indexOf(lowerWord, from);
    if (index < 0) break;
    const before = index === 0 ? "" : lowerChunk[index - 1];
    const after = lowerChunk[index + lowerWord.length] ?? "";
    const bounded =
      (before === "" || !LETTER.test(before)) &&
      (after === "" || !LETTER.test(after));
    if (bounded) {
      return (
        <p lang="es" className="text-xl leading-relaxed">
          {chunk.slice(0, index)}
          <mark>{chunk.slice(index, index + lowerWord.length)}</mark>
          {chunk.slice(index + lowerWord.length)}
        </p>
      );
    }
    from = index + 1;
  }

  return (
    <p lang="es" className="text-xl leading-relaxed">
      {chunk}
    </p>
  );
}

export function StudyScreen() {
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    openStudySession()
      .then((next) => {
        if (!cancelled) setSession(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    function onVisible() {
      if (document.visibilityState !== "visible") return;
      openStudySession()
        .then((next) => {
          if (!cancelled) setSession(next);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function onNext() {
    if (!session || busy) return;
    stopSpeaking();
    setBusy(true);
    try {
      setSession(await showNext(session));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-full items-center px-5">
        <p>この端末では記録を保存できません。</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-full items-center px-5">
        <p className="text-muted">読み込み中</p>
      </div>
    );
  }

  const total = session.items.length;
  const repeating = total > 0 && session.position >= total;

  return (
    <div className="flex min-h-full flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted">スペイン語単語帳</p>
        {total > 0 ? (
          <p className="text-sm tabular-nums text-muted">
            {repeating ? "繰り返し" : `${session.position + 1} / ${total}`}
          </p>
        ) : null}
      </div>

      {total === 0 ? (
        <div className="flex flex-1 items-center">
          <p className="text-xl leading-relaxed">今日見る単語はありません。</p>
        </div>
      ) : (
        <Card session={session} busy={busy} onNext={onNext} />
      )}
    </div>
  );
}

function Card({
  session,
  busy,
  onNext,
}: {
  session: SessionRecord;
  busy: boolean;
  onNext: () => void;
}) {
  const item = cardAt(session.items, session.position);
  const word = item ? wordsById.get(item.wordId) : undefined;
  const [speechUnavailable, setSpeechUnavailable] = useState(false);

  useEffect(() => {
    const synthesis = window.speechSynthesis;
    if (!synthesis) return;
    synthesis.getVoices();
    const loadVoices = () => synthesis.getVoices();
    synthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      synthesis.removeEventListener("voiceschanged", loadVoices);
      stopSpeaking();
    };
  }, [item?.wordId]);

  function onSpeak() {
    if (!word) return;
    setSpeechUnavailable(!speakSpanish([word.spanish, word.chunk]));
  }

  return (
    <div className="flex flex-1 flex-col">
      <article className="flex flex-1 flex-col justify-center gap-8 py-8">
        {word ? (
          <>
            <h1 lang="es" className="text-5xl leading-tight font-semibold tracking-tight">
              {word.spanish}
            </h1>
            <ChunkText chunk={word.chunk} word={word.spanish} />
            <p className="text-lg leading-relaxed text-muted">{word.japanese}</p>
          </>
        ) : (
          <h1 className="text-2xl leading-relaxed">
            この単語はデータから外れました。
          </h1>
        )}
      </article>
      {word ? (
        <div className="mb-3">
          <button
            type="button"
            onClick={onSpeak}
            className="flex h-14 w-full items-center justify-center rounded-2xl border border-line bg-card text-lg font-semibold"
          >
            聞く
          </button>
          {speechUnavailable ? (
            <p className="mt-2 text-center text-sm text-muted">
              この端末では音声を再生できません。
            </p>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        disabled={busy}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-accent-foreground disabled:opacity-60"
      >
        次へ
      </button>
    </div>
  );
}
