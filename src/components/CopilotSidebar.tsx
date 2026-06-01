import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardData } from "../context/DashboardDataContext";
import { askLUMIX, type ChatMessage } from "../lib/openrouter";

interface Props {
  open: boolean;
  onClose: () => void;
  apiKey: string;
}

export function CopilotSidebar({ open, onClose, apiKey }: Props) {
  const { widgetsData } = useDashboardData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    setError("");
    try {
      const reply = await askLUMIX(apiKey, widgetsData, next);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-bg-raised shadow-2xl"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          <header className="flex items-center justify-between border-b border-white/10 p-4">
            <h2 className="font-bold uppercase tracking-wider text-accent-teal">🤖 LUMIX</h2>
            <button onClick={onClose} aria-label="Close" className="text-text-muted transition hover:text-text-bright">
              ✕
            </button>
          </header>

          {!apiKey ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-text-muted">
              Set your OpenRouter API key (gear icon in the header) to chat with LUMIX.
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-auto p-4">
                {messages.length === 0 && (
                  <p className="text-sm text-text-muted">Ask LUMIX about your dashboard — mail, weather, todos, spend…</p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "ml-auto bg-accent-amber/15 text-text-bright"
                        : "bg-white/5 text-text-bright"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {pending && <p className="text-xs text-text-muted">LUMIX is thinking…</p>}
                {error && <p className="text-xs text-accent-coral">{error}</p>}
              </div>
              <div className="flex gap-2 border-t border-white/10 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask LUMIX…"
                  className="flex-1 rounded-lg border border-white/10 bg-card px-3 py-2 text-sm text-text-bright outline-none placeholder:text-text-muted focus:border-accent-teal/50"
                />
                <button
                  onClick={send}
                  disabled={pending}
                  className="rounded-lg bg-accent-teal/20 px-3 py-2 text-sm font-semibold text-accent-teal transition hover:bg-accent-teal/30 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
