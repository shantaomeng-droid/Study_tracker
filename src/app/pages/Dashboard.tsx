import { useState } from "react";
import { Check, Trash2, Pencil, ChevronDown } from "lucide-react";
import { useApp } from "../lib/context";
import {
  STATUS_LABELS, PRIORITY_LABELS, PRIORITY_RANK, priorityColor,
  formatDate, isOverdue,
} from "../lib/types";
import type { Status } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

type SortKey = "due" | "priority" | "title";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "due", label: "Due Date" },
  { key: "priority", label: "Priority" },
  { key: "title", label: "Title" },
];

export function Dashboard() {
  const { assignments, setStatus, remove, openEdit } = useApp();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [sort, setSort] = useState<SortKey>("due");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = {
    all: assignments.length,
    todo: assignments.filter((a) => a.status === "todo").length,
    "in-progress": assignments.filter((a) => a.status === "in-progress").length,
    done: assignments.filter((a) => a.status === "done").length,
  };

  const progress = assignments.length ? Math.round((counts.done / assignments.length) * 100) : 0;

  const filtered = (filter === "all" ? assignments : assignments.filter((a) => a.status === filter))
    .slice()
    .sort((a, b) => {
      if (sort === "due") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return a.title.localeCompare(b.title);
    });

  return (
    <>
      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border mb-12">
        {(["all", "todo", "in-progress", "done"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border-r border-b border-border px-6 py-6 text-left transition-colors duration-200 ${
              filter === s ? "bg-primary text-primary-foreground" : "hover:bg-card"
            }`}
          >
            <p
              className={`text-[10px] tracking-[0.2em] uppercase mb-2 ${
                filter === s ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}
              style={mono}
            >
              {s === "all" ? "All Tasks" : STATUS_LABELS[s]}
            </p>
            <p className="text-4xl font-bold" style={serif}>{counts[s]}</p>
          </button>
        ))}
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-12">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="text-xs tracking-[0.25em] uppercase" style={mono}>Overall Progress</h2>
          <span className="text-xs text-muted-foreground" style={mono}>
            {counts.done} of {counts.all} complete
          </span>
        </div>
        <div className="h-1.5 w-full bg-muted">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground" style={mono}>{progress}%</p>
      </div>

      {/* LIST HEADER + SORT */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-6 pt-6">
          <h2 className="text-xs tracking-[0.25em] uppercase" style={mono}>
            {filter === "all" ? "All Assignments" : STATUS_LABELS[filter]}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground" style={mono}>
              Sort
            </span>
            <div className="flex border border-border">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors ${
                    sort === s.key
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={mono}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground" style={mono}>
              {filtered.length} {filtered.length === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-border border-dashed">
            <p className="text-muted-foreground text-sm" style={serif}>
              No tasks here — enjoy the silence.
            </p>
          </div>
        )}

        <div className="flex flex-col">
          {filtered.map((a) => (
            <div key={a.id} className={`border-b border-border ${a.status === "done" ? "opacity-60" : ""}`}>
              <div
                className="flex items-start gap-4 py-5 cursor-pointer hover:bg-card transition-colors duration-150 px-2 -mx-2"
                onClick={() => setExpandedId((p) => (p === a.id ? null : a.id))}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatus(a.id, a.status === "done" ? "todo" : "done");
                  }}
                  className={`mt-0.5 shrink-0 w-5 h-5 border flex items-center justify-center transition-colors duration-200 ${
                    a.status === "done"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:border-accent"
                  }`}
                  aria-label="Toggle complete"
                >
                  {a.status === "done" && <Check size={11} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span
                      className={`text-base leading-snug ${a.status === "done" ? "line-through" : ""}`}
                      style={serif}
                    >
                      {a.title}
                    </span>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground" style={mono}>
                      {a.topic}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-1 items-center">
                    <span
                      className={`text-[10px] tracking-[0.15em] uppercase ${
                        isOverdue(a.dueDate, a.status) ? "text-accent font-medium" : "text-muted-foreground"
                      }`}
                      style={mono}
                    >
                      {isOverdue(a.dueDate, a.status) ? "Overdue · " : ""}{formatDate(a.dueDate)}
                    </span>
                    <span className={`text-[10px] tracking-[0.15em] uppercase ${priorityColor[a.priority]}`} style={mono}>
                      {PRIORITY_LABELS[a.priority]} priority
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={a.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); setStatus(a.id, e.target.value as Status); }}
                    className="text-[10px] tracking-[0.15em] uppercase bg-secondary text-secondary-foreground border border-border px-2 py-1 cursor-pointer appearance-none focus:outline-none hover:border-foreground transition-colors"
                    style={mono}
                  >
                    {(["todo", "in-progress", "done"] as Status[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(a.id); }}
                    className="text-muted-foreground hover:text-accent transition-colors p-1"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform duration-200 ${expandedId === a.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {expandedId === a.id && (
                <div className="pb-5 px-9">
                  <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-1" style={mono}>
                    Notes
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {a.notes || "No notes added."}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
