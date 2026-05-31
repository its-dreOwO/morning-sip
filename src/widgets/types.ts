import type { FC } from "react";
import type { WidgetDataResult } from "../data/types";

export type AccentName = "amber" | "teal" | "coral" | "violet" | "green";
export type WidgetState = "loading" | "ready" | "empty" | "error";

export interface WidgetSize { w: number; h: number; }

export interface WidgetViewProps<TData> {
  data: TData | null;
  state: WidgetState;
  expanded: boolean;
}

export interface WidgetDefinition<TData = unknown> {
  id: string;
  name: string;
  accent: AccentName;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  Component: FC<WidgetViewProps<TData>>;
  useData: () => WidgetDataResult<TData>;
}
