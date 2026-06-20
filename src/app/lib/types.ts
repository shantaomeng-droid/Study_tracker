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

export function formatDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function isOverdue(dueDate: string, status: Status) {
  if (status === "done" || !dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}
