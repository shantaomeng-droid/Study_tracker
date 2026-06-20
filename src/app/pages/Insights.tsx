import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip,
  PieChart, Pie,
} from "recharts";
import { useApp } from "../lib/context";
import { STATUS_LABELS, isOverdue } from "../lib/types";
import type { Status } from "../lib/types";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const serif = { fontFamily: "'Playfair Display', serif" } as const;

const STATUS_COLORS: Record<Status, string> = {
  todo: "var(--muted-foreground)",
  "in-progress": "var(--chart-4)",
  done: "var(--chart-2)",
};

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="border-r border-b border-border px-6 py-6">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2" style={mono}>{label}</p>
      <p className={`text-4xl font-bold ${accent ? "text-accent" : ""}`} style={serif}>{value}</p>
    </div>
  );
}

export function Insights() {
  const { assignments } = useApp();

  const total = assignments.length;
  const done = assignments.filter((a) => a.status === "done").length;
  const overdue = assignments.filter((a) => isOverdue(a.dueDate, a.status)).length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  const byTopic = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) map.set(a.topic, (map.get(a.topic) ?? 0) + 1);
    return [...map.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }, [assignments]);

  const byStatus = useMemo(() => {
    return (["todo", "in-progress", "done"] as Status[])
      .map((s) => ({ name: STATUS_LABELS[s], value: assignments.filter((a) => a.status === s).length, status: s }))
      .filter((d) => d.value > 0);
  }, [assignments]);

  const tooltipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 0,
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    color: "var(--popover-foreground)",
  };

  return (
    <>
      <h1 className="text-3xl font-bold border-t border-border pt-6 mb-8" style={serif}>Insights</h1>

      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-border mb-12">
        <Stat label="Total Tasks" value={total} />
        <Stat label="Completed" value={done} />
        <Stat label="Completion" value={`${completion}%`} />
        <Stat label="Overdue" value={overdue} accent={overdue > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* By topic */}
        <div className="border-t border-border pt-6">
          <h2 className="text-xs tracking-[0.25em] uppercase mb-6" style={mono}>Tasks by Topic</h2>
          {byTopic.length === 0 ? (
            <p className="text-sm text-muted-foreground" style={serif}>No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(byTopic.length * 38, 120)}>
              <BarChart data={byTopic} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="topic"
                  width={92}
                  tick={{ fontSize: 10, fontFamily: "'DM Mono', monospace", fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" fill="var(--accent)" barSize={14} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By status */}
        <div className="border-t border-border pt-6">
          <h2 className="text-xs tracking-[0.25em] uppercase mb-6" style={mono}>Status Breakdown</h2>
          {byStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground" style={serif}>No data yet.</p>
          ) : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="var(--background)"
                  >
                    {byStatus.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {byStatus.map((d) => (
                  <div key={d.status} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5" style={{ background: STATUS_COLORS[d.status] }} />
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground" style={mono}>
                      {d.name} · {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
