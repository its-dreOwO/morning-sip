import type { WidgetDefinition } from "../widgets/types";
import { WidgetFrame } from "./WidgetFrame";

export function WidgetHost({ def }: { def: WidgetDefinition }) {
  const result = def.useData();
  const Component = def.Component;
  return (
    <WidgetFrame title={def.name} accent={def.accent} state={result.state} error={result.error}>
      <Component data={result.data} state={result.state} expanded={false} />
    </WidgetFrame>
  );
}
