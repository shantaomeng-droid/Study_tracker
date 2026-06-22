import { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
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

  const labelCls = "text-[11px] tracking-[0.14em] uppercase text-foreground font-medium block mb-1.5";
  const hintCls = "text-[11px] text-muted-foreground mb-2";
  const fieldCls =
    "w-full bg-input-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground focus:ring-1 focus:ring-ring transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="bg-background w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <div>
            <span className="text-sm tracking-[0.16em] uppercase font-medium" style={mono}>
              {editing ? "Edit Assignment" : "New Assignment"}
            </span>
            <p className="text-[11px] text-muted-foreground mt-1">
              {editing ? "Update the details below." : "Fill in the details to add a task."}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close" title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="px-8 py-6 flex flex-col gap-5">
          <div>
            <label className={labelCls} style={mono}>
              Task Title <span className="text-accent">(required)</span>
            </label>
            <p className={hintCls}>What do you need to do?</p>
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
              <label className={labelCls} style={mono}>Subject / Topic</label>
              <div className="relative">
                <select
                  value={form.topic}
                  onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                  className={fieldCls + " appearance-none cursor-pointer pr-9"}
                  style={sans}
                >
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls} style={mono}>Priority</label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                  className={fieldCls + " appearance-none cursor-pointer pr-9"}
                  style={sans}
                >
                  <option value="low">Low — can wait</option>
                  <option value="medium">Medium — soon</option>
                  <option value="high">High — urgent</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls} style={mono}>Due Date</label>
            <p className={hintCls}>Leave blank if there's no deadline.</p>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className={fieldCls}
              style={sans}
            />
          </div>

          <div>
            <label className={labelCls} style={mono}>Notes <span className="text-muted-foreground font-normal normal-case tracking-normal">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any extra details, links, or reminders…"
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
