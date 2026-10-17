import type { Metadata } from "next";
import { BenchProvider } from "@/components/bench/BenchProvider";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Motor Test Bench | IoT Nexus", template: "%s | IoT Nexus" },
  description:
    "An embedded motor laboratory for speed control, sensor measurements, and repeatable experiments.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <BenchProvider>
          <AppShell>{children}</AppShell>
        </BenchProvider>
      </body>
    </html>
  );
}
