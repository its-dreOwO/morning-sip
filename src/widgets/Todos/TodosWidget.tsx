import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { useLocalStorage } from "../../lib/useLocalStorage";

export interface TodoItem { id: string; text: string; done: boolean; }
export interface TodosData { items: TodoItem[]; onToggle: (id: string) => void; }

export function TodosView({ data, state }: WidgetViewProps<TodosData>) {
  if (state !== "ready" || !data) return null;
  const remaining = data.items.filter((t) => !t.done).length;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-accent-green">{remaining} left</span>
      <ul className="flex flex-col gap-1">
        {data.items.map((t) => (
          <li key={t.id}>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={t.done} onChange={() => data.onToggle(t.id)} />
              <span className={t.done ? "text-text-muted line-through" : "text-text-bright"}>{t.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SEED: TodoItem[] = [
  { id: "1", text: "Ship the PR", done: false },
  { id: "2", text: "Email Sam", done: false },
  { id: "3", text: "Standup notes", done: true },
];

export function useTodosData(): WidgetDataResult<TodosData> {
  const [items, setItems] = useLocalStorage<TodoItem[]>("todos.items", SEED);
  const onToggle = (id: string) =>
    setItems(items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  return { state: "ready", data: { items, onToggle } };
}
