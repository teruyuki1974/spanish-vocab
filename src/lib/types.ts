export type Word = {
  id: string;
  spanish: string;
  chunk: string;
  japanese: string;
};

export type Interval = 1 | 3 | 7 | 30;

export type Progress = {
  wordId: string;
  firstSeenDate: string;
  nextInterval: Interval | null;
  nextDueDate: string | null;
};

export type QueueKind = "review" | "new" | "second";

export type QueueItem = {
  wordId: string;
  kind: QueueKind;
};

export type ViewRecord = {
  key: string;
  wordId: string;
  viewedAt: string;
  tokyoDate: string;
  secondOfDay: boolean;
  position: number;
};

export type SessionRecord = {
  date: string;
  items: QueueItem[];
  position: number;
  recorded: boolean;
};
