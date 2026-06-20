import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { useTodos } from "../lib/todos";
import type { Todo } from "../lib/todos";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

type Filter = "all" | "active" | "done";

export function Todos() {
  const [todos, setTodos] = useTodos();
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const remaining = todos.filter((t) => !t.done).length;
  const completed = todos.length - remaining;

  const visible = todos.filter((t) =>
    filter === "active" ? !t.done : filter === "done" ? t.done : true
  );

  function add() {
    const value = text.trim();
    if (!value) return;
    const todo: Todo = { id: Date.now().toString(), text: value, done: false };
    setTodos((prev) => [todo, ...prev]);
    setText("");
  }

  function toggle(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "done", label: "Done" },
  ];

  return (
    <>
      <div className="border-t border-border pt-6 mb-8">
        <h1 className="text-3xl font-bold" style={serif}>Quick To-Do</h1>
        <p className="text-sm text-muted-foreground mt-2">
          A scratchpad for everything that isn&apos;t a full assignment.
        </p>
      </div>

      {/* Add row */}
      <div className="flex items-stretch border border-border mb-8">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a to-do and press Enter…"
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
        <div className="flex border border-border">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors ${
                filter === f.key
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={mono}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground" style={mono}>
            {remaining} left
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
      </div>

      {/* List */}
      <div className="border-t border-border">
        {visible.length === 0 ? (
          <div className="py-16 text-center border-x border-b border-border border-dashed">
            <p className="text-muted-foreground text-sm" style={serif}>
              {filter === "done" ? "Nothing finished yet." : "All clear. Nice."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((t) => (
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
                <span className={`flex-1 text-sm ${t.done ? "line-through" : ""}`}>{t.text}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted-foreground hover:text-accent transition-colors p-1 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
