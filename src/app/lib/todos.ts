import { useEffect, useState } from "react";

const STORAGE_KEY = "study-tracker:todos";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  date: string; // YYYY-MM-DD — the day this to-do belongs to
}

/** Today's date as a YYYY-MM-DD string in the local timezone. */
export function todayYmd() {
  return toYmd(new Date());
}

export function toYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Shift a YYYY-MM-DD string by a number of days (can be negative). */
export function shiftYmd(ymd: string, days: number) {
  const d = new Date(ymd + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

const SEED: Todo[] = [
  { id: "t1", text: "Re-read lecture notes on integration by parts", done: false, date: todayYmd() },
  { id: "t2", text: "Email Mr. Harper about the lab report extension", done: false, date: todayYmd() },
  { id: "t3", text: "Print the past exam paper", done: true, date: todayYmd() },
];

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED;
    // Migrate older to-dos that have no date — pin them to today.
    return parsed.map((t: Partial<Todo>) => ({
      id: String(t.id ?? Date.now().toString()),
      text: String(t.text ?? ""),
      done: Boolean(t.done),
      date: typeof t.date === "string" && t.date ? t.date : todayYmd(),
    }));
  } catch {
    return SEED;
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      /* ignore */
    }
  }, [todos]);

  return [todos, setTodos] as const;
}
