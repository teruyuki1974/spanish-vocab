import { applyProgress, cardAt } from "./queue";
import type { Progress, SessionRecord, ViewRecord } from "./types";

const DB_NAME = "spanish-vocab";
const DB_VERSION = 1;

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDBを利用できません"));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "wordId" });
        }
        if (!db.objectStoreNames.contains("views")) {
          const views = db.createObjectStore("views", { keyPath: "key" });
          views.createIndex("byWord", "wordId");
          views.createIndex("byDate", "tokyoDate");
        }
        if (!db.objectStoreNames.contains("session")) {
          db.createObjectStore("session", { keyPath: "date" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        databasePromise = null;
        reject(request.error ?? new Error("IndexedDBを開けません"));
      };
    });
  }

  return databasePromise;
}

function requestDone<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllProgress(): Promise<Progress[]> {
  const db = await openDatabase();
  const request = db
    .transaction("progress", "readonly")
    .objectStore("progress")
    .getAll();
  return requestDone(request);
}

export async function getAllViews(): Promise<ViewRecord[]> {
  const db = await openDatabase();
  const request = db
    .transaction("views", "readonly")
    .objectStore("views")
    .getAll();
  return requestDone(request);
}

export async function getSession(date: string): Promise<SessionRecord | undefined> {
  const db = await openDatabase();
  const request = db
    .transaction("session", "readonly")
    .objectStore("session")
    .get(date);
  return requestDone(request);
}

export async function putSession(session: SessionRecord): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("session", "readwrite");
    transaction.objectStore("session").put(session);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function recordCurrent(session: SessionRecord): Promise<SessionRecord> {
  const item = cardAt(session.items, session.position);
  if (!item) return session;

  const db = await openDatabase();
  const updated: SessionRecord = { ...session, recorded: true };
  const key = `${session.date}#${session.position}`;

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(
      ["progress", "views", "session"],
      "readwrite",
    );
    const views = transaction.objectStore("views");
    const progressStore = transaction.objectStore("progress");
    const sessions = transaction.objectStore("session");
    const existingRequest = views.get(key);

    existingRequest.onsuccess = () => {
      if (!existingRequest.result) {
        const view: ViewRecord = {
          key,
          wordId: item.wordId,
          viewedAt: new Date().toISOString(),
          tokyoDate: session.date,
          secondOfDay: item.kind === "second",
          position: session.position,
        };
        views.put(view);

        if (item.kind !== "second") {
          const progressRequest = progressStore.get(item.wordId);
          progressRequest.onsuccess = () => {
            const next = applyProgress(
              progressRequest.result as Progress | undefined,
              item.kind,
              session.date,
              item.wordId,
            );
            if (next) progressStore.put(next);
          };
        }
      }
      sessions.put(updated);
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  return updated;
}
