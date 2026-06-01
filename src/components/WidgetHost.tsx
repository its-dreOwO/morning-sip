import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { WidgetDefinition } from "../widgets/types";
import { WidgetFrame } from "./WidgetFrame";
import { ExpandOverlay } from "./ExpandOverlay";

export function WidgetHost({ def, onRemove }: { def: WidgetDefinition; onRemove?: () => void }) {
  const result = def.useData();
  const Component = def.Component;
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <WidgetFrame
        title={def.name}
        accent={def.accent}
        state={result.state}
        error={result.error}
        onExpand={() => setExpanded(true)}
        onRemove={onRemove}
      >
        <Component data={result.data} state={result.state} expanded={false} />
      </WidgetFrame>
      <AnimatePresence>
        {expanded && (
          <ExpandOverlay title={def.name} onClose={() => setExpanded(false)}>
            <Component data={result.data} state={result.state} expanded={true} />
          </ExpandOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
