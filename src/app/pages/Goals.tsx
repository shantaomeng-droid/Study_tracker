import { useState } from "react";
import { Plus, Check, Trash2, Pencil, X } from "lucide-react";
import { useGoals, GOAL_TERMS } from "../lib/goals";
import type { Goal, GoalTerm } from "../lib/goals";
import { formatDate } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

interface Draft {
  title: string;
  targetDate: string;
  notes: string;
}

const emptyDraft: Draft = { title: "", targetDate: "", notes: "" };

export function Goals() {
  const [goals, setGoals] = useGoals();
  const [newText, setNewText] = useState<Record<GoalTerm, string>>({ short: "", mid: "", long: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  function add(term: GoalTerm) {
    const value = newText[term].trim();
    if (!value) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: value,
      term,
      targetDate: "",
      notes: "",
      done: false,
    };
    setGoals((prev) => [goal, ...prev]);
    setNewText((prev) => ({ ...prev, [term]: "" }));
  }

  function toggle(id: string) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function remove(id: string) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function startEdit(g: Goal) {
    setEditingId(g.id);
    setDraft({ title: g.title, targetDate: g.targetDate, notes: g.notes });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function saveEdit() {
    const title = draft.title.trim();
    if (!editingId || !title) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === editingId
          ? { ...g, title, targetDate: draft.targetDate, notes: draft.notes.trim() }
          : g
      )
    );
    cancelEdit();
  }

  return (
    <>
      <div className="border-t border-border pt-6 mb-8">
        <h1 className="text-3xl font-bold" style={serif}>Goals</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Keep your short-, mid-, and long-term goals in view. Add, edit, and tick them off.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {GOAL_TERMS.map(({ key, label, blurb }) => {
          const list = goals.filter((g) => g.term === key);
          const done = list.filter((g) => g.done).length;

          return (
            <section key={key}>
              <div className="flex items-baseline justify-between border-b border-border pb-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold" style={serif}>{label}</h2>
                  <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground mt-1" style={mono}>
                    {blurb}
                  </p>
                </div>
                <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground" style={mono}>
                  {list.length === 0 ? "Empty" : `${done}/${list.length} done`}
                </span>
              </div>

              {/* Add row */}
              <div className="flex items-stretch border border-border mb-5">
                <input
                  type="text"
                  value={newText[key]}
                  onChange={(e) => setNewText((prev) => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && add(key)}
                  placeholder={`Add a ${label.toLowerCase()} goal…`}
                  className="flex-1 bg-input-background px-4 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => add(key)}
                  disabled={!newText[key].trim()}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={mono}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Goals list */}
              {list.length === 0 ? (
                <div className="py-10 text-center border border-border border-dashed">
                  <p className="text-muted-foreground text-sm" style={serif}>
                    No {label.toLowerCase()} goals yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-px bg-border border border-border">
                  {list.map((g) =>
                    editingId === g.id ? (
                      <div key={g.id} className="bg-background p-4 flex flex-col gap-3">
                        <input
                          autoFocus
                          value={draft.title}
                          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                          placeholder="Goal"
                          className="bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center gap-3 flex-wrap">
                          <label className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-muted-foreground" style={mono}>
                            Target
                            <input
                              type="date"
                              value={draft.targetDate}
                              onChange={(e) => setDraft((d) => ({ ...d, targetDate: e.target.value }))}
                              className="bg-input-background border border-border px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                              style={mono}
                            />
                          </label>
                          {draft.targetDate && (
                            <button
                              onClick={() => setDraft((d) => ({ ...d, targetDate: "" }))}
                              className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-accent transition-colors"
                              style={mono}
                            >
                              Clear date
                            </button>
                          )}
                        </div>
                        <textarea
                          value={draft.notes}
                          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                          placeholder="Notes (optional)"
                          rows={2}
                          className="bg-input-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={!draft.title.trim()}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={mono}
                          >
                            <Check size={13} /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 border border-border px-4 py-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                            style={mono}
                          >
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={g.id}
                        className={`bg-background flex items-start gap-4 p-4 group ${g.done ? "opacity-60" : ""}`}
                      >
                        <button
                          onClick={() => toggle(g.id)}
                          className={`shrink-0 mt-0.5 w-5 h-5 border flex items-center justify-center transition-colors duration-200 ${
                            g.done
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border hover:border-accent"
                          }`}
                          aria-label="Toggle complete"
                        >
                          {g.done && <Check size={11} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${g.done ? "line-through" : ""}`}>{g.title}</p>
                          {(g.targetDate || g.notes) && (
                            <div className="mt-1.5 flex flex-col gap-1">
                              {g.targetDate && (
                                <span className="text-[10px] tracking-[0.15em] uppercase text-accent" style={mono}>
                                  Target · {formatDate(g.targetDate)}
                                </span>
                              )}
                              {g.notes && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{g.notes}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(g)}
                            className="text-muted-foreground hover:text-foreground hover:bg-card transition-colors p-1.5"
                            aria-label="Edit goal"
                            title="Edit goal"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => remove(g.id)}
                            className="text-muted-foreground hover:text-accent hover:bg-card transition-colors p-1.5"
                            aria-label="Delete goal"
                            title="Delete goal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
