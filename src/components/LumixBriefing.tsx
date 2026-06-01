import { useEffect, useRef, useState } from "react";
import { useDashboardData } from "../context/DashboardDataContext";
import { fetchLUMIXBriefing } from "../lib/openrouter";

interface Props {
  apiKey: string;
}

// Mounted only once a key exists. Fetches a single briefing per key using the
// latest widget snapshot via a ref, so it does not re-fire as widgets stream in.
export function LumixBriefing({ apiKey }: Props) {
  const { widgetsData } = useDashboardData();
  const widgetsRef = useRef(widgetsData);
  useEffect(() => {
    widgetsRef.current = widgetsData;
  });

  const [briefing, setBriefing] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) return;
    let active = true;
    // Let widgets settle for a beat before snapshotting the dashboard. State
    // is only touched inside the async callback, never synchronously here.
    const timer = setTimeout(() => {
      if (!active) return;
      setLoading(true);
      setError("");
      fetchLUMIXBriefing(apiKey, widgetsRef.current)
        .then((text) => active && setBriefing(text))
        .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
        .finally(() => active && setLoading(false));
    }, 600);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [apiKey]);

  if (loading && !briefing) return <p className="leading-relaxed text-text-muted">LUMIX is reading your dashboard…</p>;
  if (error) return <p className="leading-relaxed text-accent-coral">{error}</p>;
  return <p className="leading-relaxed text-text-bright">{briefing}</p>;
}
