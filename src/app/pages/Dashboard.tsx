import { useState } from "react";
import { Check, Trash2, Pencil, ChevronDown, Plus, AlertTriangle } from "lucide-react";
import { useApp } from "../lib/context";
import {
  STATUS_LABELS, STATUS_META, PRIORITY_RANK,
  formatDate, isOverdue,
} from "../lib/types";
import type { Status } from "../lib/types";
import { PriorityBadge } from "../components/Badges";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

type SortKey = "due" | "priority" | "title";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "due", label: "Due Date" },
  { key: "priority", label: "Priority" },
  { key: "title", label: "Title" },
];

export function Dashboard() {
  const { assignments, setStatus, remove, openEdit, openAdd } = useApp();
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
      {/* PAGE HEADER */}
      <div className="border-t border-border pt-6 mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={serif}>Your Assignments</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Track every task from start to finish. Tap a card below to filter, or check one off when it's done.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
          style={mono}
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* FILTER CARDS */}
      <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3" style={mono}>
        Filter by status
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border mb-12">
        {(["all", "todo", "in-progress", "done"] as const).map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              aria-pressed={active}
              title={s === "all" ? "Show all tasks" : `Show only ${STATUS_LABELS[s]} tasks`}
              className={`relative border-r border-b border-border px-6 py-5 text-left transition-colors duration-200 ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {s !== "all" && (
                  <span className={`w-2 h-2 rounded-full ${STATUS_META[s as Status].dot}`} />
                )}
                <p
                  className={`text-[11px] tracking-[0.16em] uppercase ${
                    active ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                  style={mono}
                >
                  {s === "all" ? "All Tasks" : STATUS_LABELS[s]}
                </p>
              </div>
              <p className="text-4xl font-bold" style={serif}>{counts[s]}</p>
              {active && (
                <span className="absolute top-2 right-2 text-[9px] tracking-[0.15em] uppercase text-primary-foreground/70" style={mono}>
                  Showing
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-12">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="text-sm tracking-[0.16em] uppercase font-medium" style={mono}>Overall Progress</h2>
          <span className="text-sm font-medium" style={mono}>
            {progress}% <span className="text-muted-foreground font-normal">· {counts.done} of {counts.all} done</span>
          </span>
        </div>
        <div className="h-2 w-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* LIST HEADER + SORT */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-6 pt-6">
          <h2 className="text-sm tracking-[0.16em] uppercase font-medium" style={mono}>
            {filter === "all" ? "All Assignments" : STATUS_LABELS[filter]}
            <span className="ml-2 text-muted-foreground normal-case tracking-normal">
              ({filtered.length})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground" style={mono}>
              Sort by
            </span>
            <div className="flex border border-border">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                  className={`text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 transition-colors ${
                    sort === s.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                  style={mono}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center border border-border border-dashed flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-base" style={serif}>
              {assignments.length === 0
                ? "No assignments yet — add your first one to get started."
                : "No tasks match this filter."}
            </p>
            {assignments.length === 0 && (
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors"
                style={mono}
              >
                <Plus size={14} /> Add Task
              </button>
            )}
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
                  aria-label={a.status === "done" ? "Mark as not done" : "Mark as done"}
                  title={a.status === "done" ? "Mark as not done" : "Mark as done"}
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
                    <span className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground border border-border px-1.5 py-0.5" style={mono}>
                      {a.topic}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {isOverdue(a.dueDate, a.status) && (
                      <span className="inline-flex items-center gap-1 border border-accent/30 bg-accent/10 text-accent px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase font-medium" style={mono}>
                        <AlertTriangle size={10} /> Overdue
                      </span>
                    )}
                    <span className="inline-flex items-center text-[11px] text-muted-foreground" style={mono}>
                      Due&nbsp;{formatDate(a.dueDate)}
                    </span>
                    <PriorityBadge priority={a.priority} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="relative flex items-center" onClick={(e) => e.stopPropagation()} title="Change status">
                    <span className={`absolute left-2 w-2 h-2 rounded-full pointer-events-none ${STATUS_META[a.status].dot}`} />
                    <select
                      value={a.status}
                      onChange={(e) => { e.stopPropagation(); setStatus(a.id, e.target.value as Status); }}
                      className="text-[11px] tracking-[0.1em] uppercase bg-secondary text-secondary-foreground border border-border pl-6 pr-7 py-1.5 cursor-pointer appearance-none focus:outline-none focus:border-foreground hover:border-foreground transition-colors"
                      style={mono}
                      aria-label="Change status"
                    >
                      {(["todo", "in-progress", "done"] as Status[]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 text-muted-foreground pointer-events-none" />
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                    className="text-muted-foreground hover:text-foreground hover:bg-card transition-colors p-1.5"
                    aria-label="Edit task"
                    title="Edit task"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(a.id); }}
                    className="text-muted-foreground hover:text-accent hover:bg-card transition-colors p-1.5"
                    aria-label="Delete task"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`text-muted-foreground transition-transform duration-200 ${expandedId === a.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {expandedId === a.id && (
                <div className="pb-5 px-9">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5" style={mono}>
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed">
                    {a.notes || <span className="text-muted-foreground italic">No notes added.</span>}
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
