import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockMail, type MailData } from "../../data/sources/mailSource";
import { AnimatedNumber } from "../../components/AnimatedNumber";

export function MailView({ data, state }: WidgetViewProps<MailData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-accent-coral">
          <AnimatedNumber value={data.unread} />
        </span>
        <span className="text-xs font-semibold text-accent-coral">{data.urgent} urgent</span>
      </div>
      <span className="text-xs text-text-muted">unread</span>
      <span className="text-xs text-text-muted">{data.senders.join(", ")}…</span>
    </div>
  );
}

export function useMailData(): WidgetDataResult<MailData> {
  return { state: "ready", data: getMockMail() };
}
