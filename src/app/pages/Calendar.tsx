import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { useApp } from "../lib/context";
import { useTodos } from "../lib/todos";
import { priorityColor } from "../lib/types";
import type { Assignment } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dotColor: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-amber-700",
  high: "bg-accent",
};

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Calendar() {
  const { assignments, openEdit } = useApp();
  const [todos] = useTodos();
  const navigate = useNavigate();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const byDate = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    for (const a of assignments) {
      if (!a.dueDate) continue;
      const list = map.get(a.dueDate) ?? [];
      list.push(a);
      map.set(a.dueDate, list);
    }
    return map;
  }, [assignments]);

  // Count of unfinished to-dos per day, so the calendar reflects the daily lists.
  const todoCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of todos) {
      if (t.done) continue;
      map.set(t.date, (map.get(t.date) ?? 0) + 1);
    }
    return map;
  }, [todos]);

  // Build the grid of days (leading blanks so the 1st lands on the right weekday; Mon-first).
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lead = (firstDay.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = ymd(today);
  const unscheduled = assignments.filter((a) => !a.dueDate);

  return (
    <>
      <div className="flex items-center justify-between border-t border-border pt-6 mb-8">
        <h1 className="text-3xl font-bold" style={serif}>
          {MONTHS[month]} <span className="text-muted-foreground">{year}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="text-[10px] tracking-[0.18em] uppercase px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            style={mono}
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-border">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="border-r border-b border-border px-2 py-2 text-[10px] tracking-[0.15em] uppercase text-muted-foreground text-center"
            style={mono}
          >
            {w}
          </div>
        ))}
        {cells.map((date, i) => {
          const key = date ? ymd(date) : `blank-${i}`;
          const dateStr = date ? ymd(date) : "";
          const items = date ? byDate.get(dateStr) ?? [] : [];
          const todos = date ? todoCount.get(dateStr) ?? 0 : 0;
          const isToday = date && dateStr === todayStr;
          return (
            <div
              key={key}
              className={`border-r border-b border-border min-h-[92px] p-2 align-top ${
                date ? "" : "bg-card/40"
              } ${isToday ? "bg-card" : ""}`}
            >
              {date && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => navigate(`/todos?d=${dateStr}`)}
                      title={`Open to-do list for ${dateStr}`}
                      className={`text-[11px] hover:text-accent transition-colors ${
                        isToday ? "text-accent font-medium" : "text-muted-foreground"
                      }`}
                      style={mono}
                    >
                      {date.getDate()}
                    </button>
                    {todos > 0 && (
                      <button
                        onClick={() => navigate(`/todos?d=${dateStr}`)}
                        title={`${todos} to-do${todos > 1 ? "s" : ""}`}
                        className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-accent transition-colors"
                        style={mono}
                      >
                        <CheckSquare size={9} />
                        {todos}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {items.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => openEdit(a)}
                        title={a.title}
                        className={`flex items-center gap-1.5 text-left text-[10px] leading-tight truncate hover:underline ${
                          a.status === "done" ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${dotColor[a.priority]}`} />
                        <span className="truncate">{a.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-6">
        {(["high", "medium", "low"] as const).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor[p]}`} />
            <span className={`text-[10px] tracking-[0.15em] uppercase ${priorityColor[p]}`} style={mono}>
              {p} priority
            </span>
          </div>
        ))}
      </div>

      {unscheduled.length > 0 && (
        <div className="border-t border-border mt-12 pt-6">
          <h2 className="text-xs tracking-[0.25em] uppercase mb-4" style={mono}>Unscheduled</h2>
          <div className="flex flex-wrap gap-3">
            {unscheduled.map((a) => (
              <button
                key={a.id}
                onClick={() => openEdit(a)}
                className="text-xs border border-border px-3 py-2 hover:border-foreground transition-colors"
              >
                {a.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
