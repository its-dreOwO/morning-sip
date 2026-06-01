import { useState } from "react";

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
  onClear: () => void;
}

export function ApiKeyPopover({ apiKey, onSave, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const save = () => {
    const value = draft.trim();
    if (!value) return;
    onSave(value);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="LUMIX settings"
        className="text-[11px] text-text-muted transition hover:text-text-bright"
        title={apiKey ? "LUMIX connected" : "Set OpenRouter API key"}
      >
        {apiKey ? "⚙︎" : "⚙"}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-64 rounded-lg border border-white/10 bg-bg-raised p-3 text-left shadow-xl">
          <p className="mb-2 text-[11px] text-text-muted">
            {apiKey ? "LUMIX is connected." : "Paste your OpenRouter API key to activate LUMIX."}
          </p>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="OpenRouter API key"
            className="mb-2 w-full rounded-md border border-white/10 bg-card px-2 py-1.5 text-xs text-text-bright outline-none placeholder:text-text-muted focus:border-accent-amber/50"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={save}
              className="rounded-md bg-accent-amber/20 px-3 py-1 text-xs font-semibold text-accent-amber transition hover:bg-accent-amber/30"
            >
              Save
            </button>
            {apiKey && (
              <button
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-xs text-text-muted transition hover:text-accent-coral"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
