import type { FC } from "react";
import type { WidgetDataResult, WidgetState } from "../data/types";

export type { WidgetState };
export type AccentName = "amber" | "teal" | "coral" | "violet" | "green";

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

/**
 * Registers a widget. Inferring TData from the argument forces `Component` and
 * `useData` to agree on the same data type at the call site, then returns the
 * type-erased `WidgetDefinition` the registry array holds. This replaces the
 * per-field `as` casts and is the only place the erasure happens.
 */
export function defineWidget<TData>(def: WidgetDefinition<TData>): WidgetDefinition {
  return def as unknown as WidgetDefinition;
}
