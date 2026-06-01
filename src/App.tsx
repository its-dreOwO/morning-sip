import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardGrid } from "./components/DashboardGrid";

export default function App() {
  return (
    <main className="mx-auto flex max-w-[1120px] flex-col gap-6 p-6">
      <DashboardHeader />
      <DashboardGrid />
    </main>
  );
}
