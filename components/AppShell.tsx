import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { SyncIndicator } from "./ui/SyncIndicator";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="relative min-w-0 flex-1 overflow-hidden px-4 py-6 md:px-8 lg:px-10">
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
            {children}
          </div>
        </main>
      </div>
      <SyncIndicator />
    </div>
  );
}
