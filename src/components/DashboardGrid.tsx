import { useEffect } from "react";
import GridLayout, { type Layout, type LayoutItem } from "react-grid-layout";
import { registry } from "../widgets/registry";
import { useLocalStorage } from "../lib/useLocalStorage";
import { WidgetHost } from "./WidgetHost";

const COLS = 6;
const ROW_HEIGHT = 90;
const WIDTH = 1080;

function layoutItemFor(id: string, x: number, y: number): LayoutItem {
  const w = registry.find((r) => r.id === id)!;
  return {
    i: id,
    x,
    y,
    w: w.defaultSize.w,
    h: w.defaultSize.h,
    minW: w.minSize.w,
    minH: w.minSize.h,
  };
}

export function defaultLayout(): LayoutItem[] {
  let x = 0;
  let y = 0;
  return registry.map((w) => {
    if (x + w.defaultSize.w > COLS) {
      x = 0;
      y += w.defaultSize.h;
    }
    const item = layoutItemFor(w.id, x, y);
    x += w.defaultSize.w;
    return item;
  });
}

/**
 * Drops layout entries whose widget no longer exists in the registry, and
 * appends a default entry (stacked at the bottom) for any registry widget the
 * stored layout doesn't yet include. Keeps a persisted layout in sync as the
 * registry grows. Pure and order-stable for a given input.
 */
export function reconcileLayout(stored: LayoutItem[]): LayoutItem[] {
  const known = new Set(registry.map((w) => w.id));
  const kept = stored.filter((l) => known.has(l.i));
  const present = new Set(kept.map((l) => l.i));
  let nextY = kept.reduce((m, l) => Math.max(m, l.y + l.h), 0);

  const added: LayoutItem[] = [];
  for (const w of registry) {
    if (present.has(w.id)) continue;
    added.push(layoutItemFor(w.id, 0, nextY));
    nextY += w.defaultSize.h;
  }
  return [...kept, ...added];
}

function sameLayout(a: LayoutItem[], b: LayoutItem[]): boolean {
  return a.length === b.length && a.every((l, i) => l.i === b[i].i);
}

export function DashboardGrid() {
  const [layout, setLayout] = useLocalStorage<LayoutItem[]>("dashboard.layout", defaultLayout());
  const reconciled = reconcileLayout(layout);

  // Persist reconciliation if it added/removed widgets (e.g. registry grew).
  useEffect(() => {
    if (!sameLayout(reconciled, layout)) setLayout(reconciled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = registry.filter((w) => reconciled.some((l) => l.i === w.id));

  return (
    <GridLayout
      className="layout"
      layout={reconciled}
      width={WIDTH}
      gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT }}
      dragConfig={{ handle: ".drag-handle" }}
      onLayoutChange={(l: Layout) => setLayout([...l])}
    >
      {visible.map((w) => (
        <div key={w.id}>
          <div className="drag-handle h-full w-full cursor-move">
            <WidgetHost def={w} />
          </div>
        </div>
      ))}
    </GridLayout>
  );
}
