import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Assignment, Priority } from "../lib/types";
import { TOPICS } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const sans = { fontFamily: "'DM Sans', sans-serif" } as const;

interface FormState {
  title: string;
  topic: string;
  dueDate: string;
  priority: Priority;
  notes: string;
}

const EMPTY: FormState = { title: "", topic: "Algebra", dueDate: "", priority: "medium", notes: "" };

interface Props {
  /** When provided, the modal is in edit mode for this assignment. */
  editing?: Assignment | null;
  onClose: () => void;
  onSubmit: (data: Omit<Assignment, "id" | "status"> & { id?: string }) => void;
}

export function TaskModal({ editing, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        topic: editing.topic,
        dueDate: editing.dueDate,
        priority: editing.priority,
        notes: editing.notes,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    if (!form.title.trim()) return;
    onSubmit({
      id: editing?.id,
      title: form.title.trim(),
      topic: form.topic,
      dueDate: form.dueDate,
      priority: form.priority,
      notes: form.notes.trim(),
    });
  }

  const labelCls = "text-[10px] tracking-[0.2em] uppercase text-muted-foreground block mb-2";
  const fieldCls =
    "w-full bg-input-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="bg-background w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <span className="text-xs tracking-[0.2em] uppercase" style={mono}>
            {editing ? "Edit Assignment" : "New Assignment"}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-8 py-6 flex flex-col gap-5">
          <div>
            <label className={labelCls} style={mono}>Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Quadratic Equations — Ex. 4.3"
              className={fieldCls + " placeholder:text-muted-foreground/50"}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={mono}>Topic</label>
              <select
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                className={fieldCls + " appearance-none cursor-pointer"}
                style={sans}
              >
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={mono}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className={fieldCls + " appearance-none cursor-pointer"}
                style={sans}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={mono}>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className={fieldCls}
              style={sans}
            />
          </div>

          <div>
            <label className={labelCls} style={mono}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any extra details..."
              rows={3}
              className={fieldCls + " resize-none placeholder:text-muted-foreground/50"}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={submit}
              disabled={!form.title.trim()}
              className="flex-1 bg-primary text-primary-foreground py-3 text-xs tracking-[0.18em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={mono}
            >
              {editing ? "Save Changes" : "Add Assignment"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border text-xs tracking-[0.18em] uppercase hover:border-foreground transition-colors duration-200"
              style={mono}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
