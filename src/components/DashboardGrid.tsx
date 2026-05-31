import GridLayout, { type Layout, type LayoutItem } from "react-grid-layout";
import { registry } from "../widgets/registry";
import { useLocalStorage } from "../lib/useLocalStorage";
import { WidgetHost } from "./WidgetHost";

const COLS = 6;
const ROW_HEIGHT = 90;
const WIDTH = 1080;

export function defaultLayout(): LayoutItem[] {
  let x = 0;
  let y = 0;
  return registry.map((w) => {
    if (x + w.defaultSize.w > COLS) {
      x = 0;
      y += w.defaultSize.h;
    }
    const item: LayoutItem = {
      i: w.id,
      x,
      y,
      w: w.defaultSize.w,
      h: w.defaultSize.h,
      minW: w.minSize.w,
      minH: w.minSize.h,
    };
    x += w.defaultSize.w;
    return item;
  });
}

export function DashboardGrid() {
  const [layout, setLayout] = useLocalStorage<LayoutItem[]>("dashboard.layout", defaultLayout());
  const visible = registry.filter((w) => layout.some((l) => l.i === w.id));

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      width={WIDTH}
      onLayoutChange={(l: Layout) => setLayout([...l])}
      draggableHandle=".drag-handle"
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
