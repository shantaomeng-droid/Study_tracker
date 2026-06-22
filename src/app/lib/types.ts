export type Status = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Assignment {
  id: string;
  title: string;
  topic: string;
  dueDate: string;
  status: Status;
  priority: Priority;
  notes: string;
}

export const TOPICS = [
  "Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry",
  "Number Theory", "Probability", "Linear Algebra", "Arithmetic",
  "Science", "English", "Other",
];

export const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const priorityColor: Record<Priority, string> = {
  low: "text-muted-foreground",
  medium: "text-amber-700",
  high: "text-accent",
};

/** Color-coded metadata so status and priority read at a glance, not as cryptic text. */
export const STATUS_META: Record<Status, { label: string; dot: string; badge: string; hint: string }> = {
  todo: {
    label: "To Do",
    dot: "bg-muted-foreground",
    badge: "bg-secondary text-secondary-foreground border-border",
    hint: "Not started yet",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/70",
    hint: "Currently working on it",
  },
  done: {
    label: "Done",
    dot: "bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/70",
    hint: "Completed",
  },
};

export const PRIORITY_META: Record<Priority, { label: string; dot: string; badge: string }> = {
  low: {
    label: "Low",
    dot: "bg-muted-foreground",
    badge: "bg-secondary text-muted-foreground border-border",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/70",
  },
  high: {
    label: "High",
    dot: "bg-accent",
    badge: "bg-accent/10 text-accent border-accent/30",
  },
};

export function formatDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function isOverdue(dueDate: string, status: Status) {
  if (status === "done" || !dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
