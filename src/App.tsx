import { useState } from "react";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardGrid } from "./components/DashboardGrid";
import { CopilotSidebar } from "./components/CopilotSidebar";
import { DashboardDataProvider } from "./context/DashboardDataContext";
import { useLocalStorage } from "./lib/useLocalStorage";

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage<string>("dashboard.openrouter_api_key", "");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <DashboardDataProvider>
      <main className="mx-auto flex max-w-[1120px] flex-col gap-6 p-6">
        <DashboardHeader
          apiKey={apiKey}
          onSaveKey={setApiKey}
          onClearKey={() => setApiKey("")}
          onOpenChat={() => setChatOpen(true)}
        />
        <DashboardGrid />
      </main>
      <CopilotSidebar open={chatOpen} onClose={() => setChatOpen(false)} apiKey={apiKey} />
    </DashboardDataProvider>
  );
}
