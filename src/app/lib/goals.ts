import { useEffect, useState } from "react";

const STORAGE_KEY = "study-tracker:goals";

export type GoalTerm = "short" | "mid" | "long";

export interface Goal {
  id: string;
  title: string;
  term: GoalTerm;
  targetDate: string; // YYYY-MM-DD, or "" when none set
  notes: string;
  done: boolean;
}

export const GOAL_TERMS: { key: GoalTerm; label: string; blurb: string }[] = [
  { key: "short", label: "Short-term", blurb: "This week or the next few days" },
  { key: "mid", label: "Mid-term", blurb: "This month or term" },
  { key: "long", label: "Long-term", blurb: "This year and beyond" },
];

const SEED: Goal[] = [
  { id: "g1", term: "short", title: "Finish the calculus problem set", targetDate: "", notes: "Chapters 4–5, all exercises.", done: false },
  { id: "g2", term: "mid", title: "Average 80%+ across the next two mock exams", targetDate: "", notes: "", done: false },
  { id: "g3", term: "long", title: "Earn an A in Mathematics this year", targetDate: "", notes: "Stay consistent — a little every day.", done: false },
];

const VALID_TERMS: GoalTerm[] = ["short", "mid", "long"];

function load(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED;
    return parsed.map((g: Partial<Goal>) => ({
      id: String(g.id ?? Date.now().toString()),
      title: String(g.title ?? ""),
      term: VALID_TERMS.includes(g.term as GoalTerm) ? (g.term as GoalTerm) : "short",
      targetDate: typeof g.targetDate === "string" ? g.targetDate : "",
      notes: typeof g.notes === "string" ? g.notes : "",
      done: Boolean(g.done),
    }));
  } catch {
    return SEED;
  }
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch {
      /* ignore */
    }
  }, [goals]);

  return [goals, setGoals] as const;
}
