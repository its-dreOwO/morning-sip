import { useEffect, useState } from "react";
import { ApiKeyPopover } from "./ApiKeyPopover";
import { LumixBriefing } from "./LumixBriefing";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good night";
}

interface Props {
  apiKey?: string;
  onSaveKey?: (key: string) => void;
  onClearKey?: () => void;
  onOpenChat?: () => void;
}

export function DashboardHeader({ apiKey, onSaveKey, onClearKey, onOpenChat }: Props = {}) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = greetingFor(time.getHours());
  const formattedHours = String(time.getHours()).padStart(2, "0");
  const formattedMinutes = String(time.getMinutes()).padStart(2, "0");
  const dateString = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="combined-header-card relative grid min-h-[130px] grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-md md:grid-cols-3 md:px-8">
      {/* Giant decorative concentric dot-rings behind the middle column.
          Purely ornamental: each ring rotates continuously via CSS — the
          digital readout carries the real time. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 320 320"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 opacity-40"
      >
        <g
          style={{ transformOrigin: "160px 160px", animation: "ring-spin 60s linear infinite" }}
        >
          <circle cx="160" cy="160" r="135" className="fill-none stroke-accent-coral stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        </g>
        <g
          style={{ transformOrigin: "160px 160px", animation: "ring-spin 3600s linear infinite" }}
        >
          <circle cx="160" cy="160" r="120" className="fill-none stroke-accent-amber stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        </g>
        <g
          style={{ transformOrigin: "160px 160px", animation: "ring-spin 43200s linear infinite" }}
        >
          <circle cx="160" cy="160" r="105" className="fill-none stroke-accent-violet stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        </g>
      </svg>

      {/* Column 1: Greeting & dotted wave */}
      <div className="z-10 flex flex-col items-start justify-center">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">Welcome back</span>
        <div className="relative inline-block pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-text-bright">
            {greeting}, <span className="font-extrabold text-accent-amber">Dre</span>
          </h1>
          <div className="absolute bottom-0.5 left-0 right-0 flex h-2 justify-between">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="h-[3.5px] w-[3.5px] rounded-full bg-accent-amber"
                style={{ animation: "wave-bounce 2s infinite ease-in-out", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Date & digital clock */}
      <div className="relative z-10 flex flex-col items-center justify-center self-center text-center">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          {dateString}
        </div>
        <div className="font-mono text-3xl font-extrabold text-text-bright">
          <span className="text-accent-amber">{formattedHours}</span>
          <span className="text-accent-amber" style={{ animation: "blink-tick 1s steps(1) infinite" }}>:</span>
          <span>{formattedMinutes}</span>
        </div>
      </div>

      {/* Column 3: LUMIX AI briefing slot */}
      <div className="z-10 flex w-full max-w-[320px] flex-col justify-self-end rounded-xl border border-white/5 bg-white/5 p-3.5 text-xs text-text-muted">
        <div className="mb-1.5 flex items-center justify-between font-bold uppercase tracking-widest text-accent-teal">
          <span>🤖 LUMIX Briefing</span>
          <div className="flex items-center gap-2">
            {onSaveKey && (
              <ApiKeyPopover apiKey={apiKey ?? ""} onSave={onSaveKey} onClear={onClearKey ?? (() => {})} />
            )}
            <button
              onClick={() => onOpenChat?.()}
              className="rounded-md border border-accent-amber/20 bg-accent-amber/15 px-2 py-0.5 text-[10px] text-accent-amber transition hover:bg-accent-amber/25"
            >
              Open Chat
            </button>
          </div>
        </div>
        {apiKey ? (
          <LumixBriefing apiKey={apiKey} />
        ) : (
          <p className="leading-relaxed">
            Add your OpenRouter key <span className="text-text-bright">(⚙)</span> to activate LUMIX briefings, or open chat to ask anything.
          </p>
        )}
      </div>
    </div>
  );
}
