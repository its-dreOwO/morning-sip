import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { WidgetState } from "../data/types";

export interface WidgetDataState {
  id: string;
  name: string;
  state: WidgetState;
  data: unknown;
  error?: string;
}

interface DashboardDataContextType {
  widgetsData: Record<string, WidgetDataState>;
  updateWidgetData: (
    id: string,
    name: string,
    state: WidgetState,
    data: unknown,
    error?: string
  ) => void;
}

function sameData(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [widgetsData, setWidgetsData] = useState<Record<string, WidgetDataState>>({});

  const updateWidgetData = useCallback(
    (id: string, name: string, state: WidgetState, data: unknown, error?: string) => {
      setWidgetsData((prev) => {
        const existing = prev[id];
        // Compare by content, not reference: widget hooks often return a fresh
        // data object every render, so a reference check would never match and
        // would loop forever (update → re-render → new ref → update …).
        if (existing && existing.state === state && existing.error === error && sameData(existing.data, data)) {
          return prev;
        }
        return { ...prev, [id]: { id, name, state, data, error } };
      });
    },
    []
  );

  return (
    <DashboardDataContext.Provider value={{ widgetsData, updateWidgetData }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}
