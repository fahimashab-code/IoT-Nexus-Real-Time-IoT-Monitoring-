import Link from "next/link";
import { ArrowRight, BarChart3, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  const features = [
    {
      title: "Unified telemetry",
      description: "Stream temperature, pressure, power, and alerts in one view.",
      icon: Radar,
    },
    {
      title: "Operational readiness",
      description: "Shift operators from raw data to prioritized actions fast.",
      icon: ShieldCheck,
    },
    {
      title: "Dashboard polish",
      description: "A modern UI that feels production-grade from day one.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b bg-slate-950 py-20 text-white">
        <div className="container relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time fleet clarity
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              {siteConfig.name} helps operators keep IoT fleets calm, even at scale.
            </h1>
            <p className="text-lg text-white/70">
              A structured UI kit for telemetry, alerts, and device health that looks like a
              production control room.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.auth.register}>
                  Launch dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href={routes.public.pricing}>View pricing</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-white/50">
              <span>99.98% uptime</span>
              <span>Soc2-ready</span>
              <span>5 min setup</span>
            </div>
          </div>
          <Card className="border-white/10 bg-white/5 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-300" />
                Command Center Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Active Nodes", value: "128", trend: "+12 today", tone: "text-emerald-300" },
                  { label: "Live Alerts", value: "6", trend: "2 critical", tone: "text-rose-300" },
                  { label: "Avg. Latency", value: "220ms", trend: "Stable", tone: "text-blue-300" },
                  { label: "Power Load", value: "62%", trend: "Nominal", tone: "text-purple-300" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">{item.label}</p>
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className={`text-xs ${item.tone}`}>{item.trend}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Updated 2 min ago</span>
                <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-emerald-200">
                  Fleet healthy
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/3 top-10 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        </div>
      </section>

      <section id="features" className="container py-16">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold">Built for clear operational decisions</h2>
          <p className="text-muted-foreground">
            Everything here is structured like a real control room: data first, noise removed.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="space-y-4">
                <feature.icon className="h-10 w-10 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Operator workflow
            </p>
            <h2 className="text-3xl font-semibold">From telemetry to action in three moves</h2>
            <p className="text-muted-foreground">
              The UI mirrors how teams actually work: triage, diagnose, then resolve.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <span className="text-base font-semibold text-foreground">01</span>
                <div>
                  <p className="font-medium text-foreground">Monitor live signals</p>
                  <p>Highlight anomalies with threshold-aware gauges.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <span className="text-base font-semibold text-foreground">02</span>
                <div>
                  <p className="font-medium text-foreground">Drill into devices</p>
                  <p>Inspect telemetry history and diagnostics quickly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <span className="text-base font-semibold text-foreground">03</span>
                <div>
                  <p className="font-medium text-foreground">Resolve with context</p>
                  <p>See firmware, battery, and recent events in one panel.</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="border-border/60 bg-muted/20">
            <CardHeader>
              <CardTitle>Live incident queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              {[
                { label: "Sensor Node 12", status: "High vibration", tone: "text-rose-500" },
                { label: "Cold Chain 04", status: "Temperature drift", tone: "text-amber-500" },
                { label: "Gateway 7B", status: "Power restored", tone: "text-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border bg-background p-4">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs">{item.status}</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.tone}`}>Live</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container pb-20">
        <div className="rounded-3xl border bg-muted/30 p-10 text-center">
          <h2 className="text-3xl font-semibold">Ready to launch your monitoring hub?</h2>
          <p className="mt-3 text-muted-foreground">
            Start with a clean, scalable Next.js foundation and customize when you are ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={routes.auth.register}>Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.public.pricing}>Compare plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
