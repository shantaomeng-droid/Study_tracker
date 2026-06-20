import { useEffect, useState } from "react";
import type { Assignment } from "./types";

const STORAGE_KEY = "maths-tracker:assignments";

const SEED: Assignment[] = [
  { id: "1", title: "Quadratic Equations — Ex. 4.3", topic: "Algebra", dueDate: "2026-06-20", status: "todo", priority: "high", notes: "Pages 112–115, all starred problems." },
  { id: "2", title: "Circle Theorems Proof Sheet", topic: "Geometry", dueDate: "2026-06-19", status: "in-progress", priority: "high", notes: "Don't forget the inscribed angle theorem." },
  { id: "3", title: "Differentiation Rules Practice", topic: "Calculus", dueDate: "2026-06-22", status: "todo", priority: "medium", notes: "" },
  { id: "4", title: "Probability Tree Diagrams", topic: "Probability", dueDate: "2026-06-18", status: "done", priority: "low", notes: "Completed in class." },
  { id: "5", title: "Standard Deviation Worksheet", topic: "Statistics", dueDate: "2026-06-21", status: "todo", priority: "medium", notes: "" },
];

function load(): Assignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [assignments]);

  return [assignments, setAssignments] as const;
}
