import { useState } from "react";
import { registry } from "../widgets/registry";

interface Props {
  hiddenIds: string[];
  onAdd: (id: string) => void;
}

export function AddWidgetMenu({ hiddenIds, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const hidden = registry.filter((w) => hiddenIds.includes(w.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm text-text-bright transition hover:bg-white/5"
      >
        + Add widget
      </button>
      {open && (
        <ul className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-white/10 bg-bg-raised p-1 shadow-xl">
          {hidden.length === 0 && (
            <li className="px-3 py-2 text-xs text-text-muted">All widgets shown</li>
          )}
          {hidden.map((w) => (
            <li key={w.id}>
              <button
                onClick={() => {
                  onAdd(w.id);
                  setOpen(false);
                }}
                className="block w-full rounded px-3 py-2 text-left text-sm text-text-bright transition hover:bg-white/5"
              >
                {w.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
