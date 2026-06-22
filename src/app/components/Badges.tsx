import { STATUS_META, PRIORITY_META } from "../lib/types";
import type { Status, Priority } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;

/** A small, clearly readable pill showing where a task stands. */
export function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${m.badge}`}
      style={mono}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/** A small pill that makes a task's priority obvious at a glance. */
export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${m.badge}`}
      style={mono}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
