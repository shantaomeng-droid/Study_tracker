import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Check, Trash2, Pencil, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useTodos, todayYmd, shiftYmd } from "../lib/todos";
import type { Todo } from "../lib/todos";
import { formatDate } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

function weekday(ymd: string) {
  return new Date(ymd + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long" });
}

export function Todos() {
  const [todos, setTodos] = useTodos();
  const [params, setParams] = useSearchParams();

  // The selected day comes from the ?d= query param (set when you click a day on
  // the calendar), falling back to today.
  const paramDate = params.get("d");
  const selected = paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate) ? paramDate : todayYmd();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const setSelected = (ymd: string) => setParams(ymd === todayYmd() ? {} : { d: ymd });

  const dayTodos = useMemo(
    () => todos.filter((t) => t.date === selected),
    [todos, selected]
  );
  const remaining = dayTodos.filter((t) => !t.done).length;
  const completed = dayTodos.length - remaining;
  const isToday = selected === todayYmd();

  function add() {
    const value = text.trim();
    if (!value) return;
    const todo: Todo = { id: Date.now().toString(), text: value, done: false, date: selected };
    setTodos((prev) => [todo, ...prev]);
    setText("");
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(t: Todo) {
    setEditingId(t.id);
    setEditText(t.text);
  }

  function saveEdit() {
    const value = editText.trim();
    if (editingId && value) {
      setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, text: value } : t)));
    }
    setEditingId(null);
    setEditText("");
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !(t.date === selected && t.done)));
  }

  return (
    <>
      <div className="border-t border-border pt-6 mb-8">
        <h1 className="text-3xl font-bold" style={serif}>Daily To-Do</h1>
        <p className="text-sm text-muted-foreground mt-2">
          One list per day, linked to your calendar. Pick a date and plan it out.
        </p>
      </div>

      {/* Day navigator */}
      <div className="flex items-center justify-between flex-wrap gap-4 border border-border p-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(shiftYmd(selected, -1))}
            className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft size={15} />
          </button>
          <div>
            <p className="text-lg font-bold leading-tight" style={serif}>
              {weekday(selected)}
            </p>
            <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground" style={mono}>
              {formatDate(selected)}{isToday ? " · Today" : ""}
            </p>
          </div>
          <button
            onClick={() => setSelected(shiftYmd(selected, 1))}
            className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Next day"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setSelected(todayYmd())}
              className="text-[10px] tracking-[0.18em] uppercase px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              style={mono}
            >
              Today
            </button>
          )}
          <label className="flex items-center gap-2 border border-border px-3 py-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer">
            <CalendarDays size={14} />
            <input
              type="date"
              value={selected}
              onChange={(e) => e.target.value && setSelected(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer"
              style={mono}
              aria-label="Jump to date"
            />
          </label>
        </div>
      </div>

      {/* Add row */}
      <div className="flex items-stretch border border-border mb-8">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={`Add a to-do for ${weekday(selected)}…`}
          className="flex-1 bg-input-background px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/50"
        />
        <button
          onClick={add}
          disabled={!text.trim()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={mono}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4">
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground" style={mono}>
          {dayTodos.length === 0 ? "Nothing planned" : `${remaining} left · ${completed} done`}
        </span>
        {completed > 0 && (
          <button
            onClick={clearCompleted}
            className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-accent transition-colors"
            style={mono}
          >
            Clear done ({completed})
          </button>
        )}
      </div>

      {/* List */}
      <div className="border-t border-border">
        {dayTodos.length === 0 ? (
          <div className="py-16 text-center border-x border-b border-border border-dashed">
            <p className="text-muted-foreground text-sm" style={serif}>
              Nothing for this day yet. Add your first to-do above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {dayTodos.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-4 py-4 border-b border-border group ${
                  t.done ? "opacity-60" : ""
                }`}
              >
                <button
                  onClick={() => toggle(t.id)}
                  className={`shrink-0 w-5 h-5 border flex items-center justify-center transition-colors duration-200 ${
                    t.done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border hover:border-accent"
                  }`}
                  aria-label="Toggle done"
                >
                  {t.done && <Check size={11} strokeWidth={3} />}
                </button>

                {editingId === t.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                    }}
                    onBlur={saveEdit}
                    className="flex-1 bg-input-background border border-border px-2 py-1 text-sm focus:outline-none focus:border-accent"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    className={`flex-1 text-sm ${t.done ? "line-through" : ""}`}
                  >
                    {t.text}
                  </span>
                )}

                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-muted-foreground hover:text-accent transition-colors p-1"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
