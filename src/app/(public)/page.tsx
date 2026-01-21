import Link from "next/link";
import { ArrowRight, Shield, Signal, Sparkles } from "lucide-react";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  const features = [
    {
      title: "Live Telemetry",
      description: "Monitor temperature, humidity, and voltage trends in real time.",
      icon: Signal,
    },
    {
      title: "Actionable Alerts",
      description: "Prioritize incidents with severity-based alert queues.",
      icon: Shield,
    },
    {
      title: "Portfolio-Ready UI",
      description: "A clean, polished template tuned for modern IoT teams.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-20 text-white">
        <div className="container relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Connected, visible, controlled
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              {siteConfig.name}: the IoT monitoring dashboard built for clarity.
            </h1>
            <p className="text-lg text-white/70">
              Ship a stunning monitoring experience with ready-made layouts,
              charts, and device management workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.auth.register}>
                  Launch dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href={routes.public.pricing}>View pricing</Link>
              </Button>
            </div>
          </div>
          <Card className="border-white/10 bg-white/5 text-white shadow-2xl">
            <CardHeader>
              <CardTitle>Network Health Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Active Gateways</p>
                  <p className="text-3xl font-semibold">112</p>
                  <p className="text-xs text-emerald-300">+8% this week</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Critical Alerts</p>
                  <p className="text-3xl font-semibold">3</p>
                  <p className="text-xs text-rose-300">Requires action</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Updated 2 min ago</span>
                <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-emerald-200">
                  99.3% uptime
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-12 h-64 w-64 rounded-full bg-emerald-500/40 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/40 blur-3xl" />
        </div>
      </section>

      <section id="features" className="container py-16">
        <div className="mb-10 max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold">Purpose-built for IoT operators</h2>
          <p className="text-muted-foreground">
            Use the best-practice structure to accelerate dashboards, device pages, and alert workflows.
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
