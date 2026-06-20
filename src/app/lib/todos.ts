import { useEffect, useState } from "react";

const STORAGE_KEY = "study-tracker:todos";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const SEED: Todo[] = [
  { id: "t1", text: "Re-read lecture notes on integration by parts", done: false },
  { id: "t2", text: "Email Mr. Harper about the lab report extension", done: false },
  { id: "t3", text: "Print the past exam paper", done: true },
];

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED;
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
