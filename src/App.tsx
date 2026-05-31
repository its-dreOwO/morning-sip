import { DashboardGrid } from "./components/DashboardGrid";

export default function App() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <main className="mx-auto max-w-[1120px] p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-bright">{greeting}, Dre</h1>
        <p className="text-sm text-text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </header>
      <DashboardGrid />
    </main>
  );
}
