import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { Plus, Sun, Moon, Menu, X, ListChecks, CalendarDays, ClipboardCheck, Target, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppContext } from "../lib/context";
import { useTheme } from "../lib/theme";

const mono = { fontFamily: "'DM Mono', monospace" } as const;

const NAV: { to: string; label: string; end: boolean; icon: LucideIcon }[] = [
  { to: "/", label: "Tasks", end: true, icon: ListChecks },
  { to: "/calendar", label: "Calendar", end: false, icon: CalendarDays },
  { to: "/todos", label: "To-Do", end: false, icon: ClipboardCheck },
  { to: "/goals", label: "Goals", end: false, icon: Target },
  { to: "/insights", label: "Insights", end: false, icon: BarChart3 },
];

export function Layout({ ctx }: { ctx: AppContext }) {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Desktop nav: icon + label, with a clear underline marking the current page.
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase pb-1 border-b-2 transition-colors duration-200 ${
      isActive
        ? "text-foreground border-accent"
        : "text-muted-foreground border-transparent hover:text-foreground"
    }`;

  return (
    <div className="bg-background text-foreground min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <header className="border-b border-border sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <div className="max-w-screen-lg mx-auto px-6 md:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <NavLink to="/" className="text-sm tracking-[0.2em] uppercase font-medium" style={mono}>
              Study Tracker
            </NavLink>
            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end} className={linkCls} style={mono}>
                  <n.icon size={14} strokeWidth={2} />
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={ctx.openAdd}
              className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs tracking-[0.15em] uppercase hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              style={mono}
              title="Create a new assignment"
            >
              <Plus size={14} />
              Add Task
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-3 text-[12px] tracking-[0.12em] uppercase transition-colors ${
                    isActive ? "text-foreground bg-card" : "text-muted-foreground hover:text-foreground"
                  }`
                }
                style={mono}
              >
                <n.icon size={16} strokeWidth={2} />
                {n.label}
              </NavLink>
            ))}
            <button
              onClick={() => { setMenuOpen(false); ctx.openAdd(); }}
              className="flex items-center gap-3 px-2 py-3 mt-2 bg-primary text-primary-foreground text-[12px] tracking-[0.12em] uppercase justify-center"
              style={mono}
            >
              <Plus size={16} /> Add Task
            </button>
          </nav>
        )}
      </header>

      <main className="max-w-screen-lg mx-auto px-6 md:px-12 py-12">
        <Outlet context={ctx} />
      </main>

      <footer className="max-w-screen-lg mx-auto px-6 md:px-12 py-8 border-t border-border">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground" style={mono}>
          Study Tracker · Stay on top of every assignment
        </p>
      </footer>
    </div>
  );
}
