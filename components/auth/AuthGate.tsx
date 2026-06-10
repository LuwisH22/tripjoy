"use client";

import { useSession } from "./SessionProvider";
import { LoginScreen } from "./LoginScreen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-cream">
        <div className="animate-pulse text-center">
          <div className="text-5xl">🧳</div>
          <p className="mt-2 font-heading font-bold text-muted">
            Loading TripJoy…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return <>{children}</>;
}
