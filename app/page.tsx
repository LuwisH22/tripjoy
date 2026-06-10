import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { HeroTrip } from "@/components/HeroTrip";
import { BudgetOverview } from "@/components/BudgetOverview";
import { ItineraryTimeline } from "@/components/ItineraryTimeline";
import { BudgetBreakdown } from "@/components/BudgetBreakdown";
import { Travelers } from "@/components/Travelers";
import { Sparkle, Cloud } from "@/components/ui/Doodles";

export default function Home() {
  return (
    <AppShell>
      <Cloud className="pointer-events-none absolute right-[20%] top-24 w-24 opacity-50" />
      <Sparkle className="pointer-events-none absolute right-10 top-48 w-6 animate-floaty opacity-70" />

      <Topbar />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <HeroTrip />
        <BudgetOverview />
      </div>

      <ItineraryTimeline />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <BudgetBreakdown />
        <Travelers />
      </div>

      <footer className="py-4 text-center text-sm font-semibold text-muted">
        Made with 💛 by TripJoy — Collect memories, not things.
      </footer>
    </AppShell>
  );
}
