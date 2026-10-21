import { tokyoDate } from "./dates";
import {
  getAllProgress,
  getSession,
  putSession,
  recordCurrent,
} from "./db";
import { buildQueue, cardAt } from "./queue";
import type { SessionRecord } from "./types";
import { words } from "./words";

let chain: Promise<unknown> = Promise.resolve();
const recording = new Map<string, Promise<SessionRecord>>();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function ensureRecorded(session: SessionRecord): Promise<SessionRecord> {
  if (session.recorded || !cardAt(session.items, session.position)) {
    return session;
  }

  const key = `${session.date}#${session.position}`;
  const pending = recording.get(key);
  if (pending) return pending;

  const promise = recordCurrent(session).finally(() => {
    recording.delete(key);
  });
  recording.set(key, promise);
  return promise;
}

async function openStudySessionOnce(): Promise<SessionRecord> {
  const today = tokyoDate();
  const existing = await getSession(today);
  if (existing) return ensureRecorded(existing);

  const progress = await getAllProgress();
  const session: SessionRecord = {
    date: today,
    items: buildQueue({
      wordIds: words.map((word) => word.id),
      progressById: new Map(progress.map((item) => [item.wordId, item])),
      today,
    }),
    position: 0,
    recorded: false,
  };
  await putSession(session);
  return ensureRecorded(session);
}

export function openStudySession(): Promise<SessionRecord> {
  return enqueue(openStudySessionOnce);
}

async function showNextOnce(session: SessionRecord): Promise<SessionRecord> {
  const today = tokyoDate();
  if (session.date !== today) return openStudySessionOnce();

  const latest = await getSession(session.date);
  if (latest && latest.position > session.position) {
    return ensureRecorded(latest);
  }

  const next: SessionRecord = {
    ...(latest ?? session),
    position: session.position + 1,
    recorded: false,
  };
  await putSession(next);
  return ensureRecorded(next);
}

export function showNext(session: SessionRecord): Promise<SessionRecord> {
  return enqueue(() => showNextOnce(session));
}
