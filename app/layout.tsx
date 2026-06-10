import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AuthGate } from "@/components/auth/AuthGate";
import { TripDataProvider } from "@/components/trip/TripDataProvider";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "TripJoy — Plan something amazing",
  description: "A playful travel itinerary & budget planner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">
        <SessionProvider>
          <AuthProvider>
            <TripDataProvider>
              <AuthGate>{children}</AuthGate>
            </TripDataProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
