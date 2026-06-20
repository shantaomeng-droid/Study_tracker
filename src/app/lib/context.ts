import { useOutletContext } from "react-router";
import type { Assignment, Status } from "./types";

export interface AppContext {
  assignments: Assignment[];
  setStatus: (id: string, status: Status) => void;
  remove: (id: string) => void;
  openAdd: () => void;
  openEdit: (a: Assignment) => void;
}

export function useApp() {
  return useOutletContext<AppContext>();
}
