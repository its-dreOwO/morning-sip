export type WidgetState = "loading" | "ready" | "empty" | "error";

export interface WidgetDataResult<T> {
  state: WidgetState;
  data: T | null;
  error?: string;
}

export function isReady<T>(
  r: WidgetDataResult<T>
): r is WidgetDataResult<T> & { state: "ready"; data: T } {
  return r.state === "ready" && r.data !== null;
}
