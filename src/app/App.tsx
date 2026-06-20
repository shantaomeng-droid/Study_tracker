import { useCallback, useState } from "react";
import { HashRouter, Routes, Route } from "react-router";
import { Layout } from "./components/Layout";
import { TaskModal } from "./components/TaskModal";
import { Dashboard } from "./pages/Dashboard";
import { Calendar } from "./pages/Calendar";
import { Insights } from "./pages/Insights";
import { Todos } from "./pages/Todos";
import { Goals } from "./pages/Goals";
import { useAssignments } from "./lib/store";
import type { AppContext } from "./lib/context";
import type { Assignment, Status } from "./lib/types";

export default function App() {
  const [assignments, setAssignments] = useAssignments();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);

  const setStatus = useCallback((id: string, status: Status) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, [setAssignments]);

  const remove = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  }, [setAssignments]);

  const openAdd = useCallback(() => { setEditing(null); setModalOpen(true); }, []);
  const openEdit = useCallback((a: Assignment) => { setEditing(a); setModalOpen(true); }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleSubmit = useCallback((data: Omit<Assignment, "id" | "status"> & { id?: string }) => {
    if (data.id) {
      setAssignments((prev) => prev.map((a) => (a.id === data.id ? { ...a, ...data, id: a.id } : a)));
    } else {
      const newA: Assignment = {
        id: Date.now().toString(),
        title: data.title,
        topic: data.topic,
        dueDate: data.dueDate,
        status: "todo",
        priority: data.priority,
        notes: data.notes,
      };
      setAssignments((prev) => [newA, ...prev]);
    }
    setModalOpen(false);
  }, [setAssignments]);

  const ctx: AppContext = { assignments, setStatus, remove, openAdd, openEdit };

  return (
    <>
      <HashRouter>
        <Routes>
          <Route element={<Layout ctx={ctx} />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="todos" element={<Todos />} />
            <Route path="goals" element={<Goals />} />
            <Route path="insights" element={<Insights />} />
            <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </HashRouter>

      {modalOpen && (
        <TaskModal editing={editing} onClose={closeModal} onSubmit={handleSubmit} />
      )}

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
      `}</style>
    </>
  );
}
