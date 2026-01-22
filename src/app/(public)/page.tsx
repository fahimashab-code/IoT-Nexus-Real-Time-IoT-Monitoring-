import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Cloud,
  Gauge,
  LayoutDashboard,
  LineChart,
  Settings,
} from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  asChild,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default:
      "bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.6)] border border-emerald-400",
    outline:
      "border border-slate-700 bg-slate-900/50 backdrop-blur-sm text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600",
    ghost: "hover:bg-slate-100 text-slate-600",
  };
  const sizes = {
    default: "h-10 px-5 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-lg px-8 text-base",
  };

  const combinedClass = `${baseStyles} ${variants[variant] || variants.default} ${
    sizes[size] || sizes.default
  } ${className}`;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, { className: combinedClass, ...props });
  }

  return (
    <button className={combinedClass} {...props}>
      {children}
    </button>
  );
};

const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => (
  <div className={`rounded-2xl border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

export default function LandingPage() {
  const features = [
    {
      title: "Device-agnostic ingest",
      description: "MQTT, HTTP, or AWS IoT. If it has a signal, we can graph it.",
      icon: Cloud,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Drag-and-drop builder",
      description: "No coding. Just drag gauges and charts to build your control room.",
      icon: LayoutDashboard,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Operator-first alerts",
      description: "Set thresholds and get notified instantly when health drops.",
      icon: Activity,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans selection:bg-emerald-500/30">
      <section className="relative bg-slate-950 pt-24 pb-32 lg:pt-32 lg:pb-56">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-500/20 opacity-30 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 backdrop-blur-md animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live Telemetry Pipeline
          </div>

          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Turn device signals into <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              beautiful dashboards.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
            Connect devices to the cloud, stream metrics, and build custom views with gauges and
            trends. Track health, spot anomalies, and act fast.
          </p>

          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
              <Link href="#register">
                Start Monitoring <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 w-full text-base sm:w-auto">
              <Link href="#demo">View Live Demo</Link>
            </Button>
          </div>

          <div className="relative z-20 mx-auto -mb-64 max-w-6xl lg:-mb-80" id="demo">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-30 blur" />

            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-700" />
                  <div className="h-3 w-3 rounded-full bg-slate-700" />
                  <div className="h-3 w-3 rounded-full bg-slate-700" />
                </div>
                <div className="mx-auto text-xs font-medium text-slate-500">
                  app.iot-monitor.io/fleet-view
                </div>
              </div>

              <div className="grid gap-4 bg-slate-950/80 p-2 md:grid-cols-[250px_1fr] sm:p-6">
                <div className="hidden space-y-6 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 md:block">
                  <div className="mb-6 flex items-center gap-2 font-bold text-emerald-400">
                    <LayoutDashboard className="h-5 w-5" /> Monitor.io
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-md bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
                      <Activity className="h-4 w-4" /> Overview
                    </div>
                    <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">
                      <Cloud className="h-4 w-4" /> Devices
                    </div>
                    <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">
                      <Settings className="h-4 w-4" /> Settings
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-800 pt-8">
                    <div className="mb-3 text-xs font-semibold uppercase text-slate-500">
                      Online Fleets
                    </div>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" /> Factory A
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" /> Warehouse B
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" /> Transport C
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { label: "Active Devices", val: "1,240", sub: "+12%", color: "text-emerald-400" },
                      { label: "Data Points/s", val: "84.5k", sub: "Stable", color: "text-blue-400" },
                      { label: "Avg Temp", val: "42C", sub: "Nominal", color: "text-slate-200" },
                      { label: "Critical Alerts", val: "3", sub: "Needs attention", color: "text-rose-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          {stat.label}
                        </div>
                        <div className="mt-1 text-2xl font-bold text-white">{stat.val}</div>
                        <div className={`mt-1 text-xs ${stat.color}`}>{stat.sub}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex h-64 flex-col rounded-lg border border-slate-800 bg-slate-900 p-4 md:col-span-2">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-300">
                          Power Consumption (kW)
                        </h4>
                        <LineChart className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex flex-1 items-end gap-1 px-2 pb-2">
                        {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 50, 65, 45, 80, 100, 85, 70].map(
                          (height, index) => (
                            <div
                              key={index}
                              style={{ height: `${height}%` }}
                              className="group relative flex-1 rounded-t-sm bg-emerald-500/20"
                            >
                              <div
                                className="absolute bottom-0 w-full rounded-t-sm bg-emerald-500 transition-all duration-500"
                                style={{ height: `${height / 2}%` }}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex h-64 flex-col rounded-lg border border-slate-800 bg-slate-900 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-300">System Load</h4>
                        <Gauge className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="relative flex flex-1 items-center justify-center">
                        <div className="relative h-32 w-32 rotate-45 rounded-full border-8 border-slate-800 border-t-emerald-500 border-r-emerald-500">
                          <div className="absolute inset-0 flex -rotate-45 flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">78%</span>
                            <span className="text-xs text-slate-500">Load</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pt-80 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900">Built for speed and clarity</h2>
            <p className="mt-4 text-lg text-slate-600">
              We stripped away the bloat. You get raw telemetry ingestion and powerful
              visualization tools in one package.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div
                  className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">
                From signal to screen in seconds
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                    1
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Connect Device</h4>
                    <p className="mt-1 text-slate-600">
                      Use our SDK or standard MQTT/HTTP endpoints to push data.
                    </p>
                  </div>
                </div>
                <div className="ml-5 h-8 w-px bg-slate-300" />
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                    2
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Configure Dashboard</h4>
                    <p className="mt-1 text-slate-600">
                      Select your widgets, bind them to data keys, and arrange layout.
                    </p>
                  </div>
                </div>
                <div className="ml-5 h-8 w-px bg-slate-300" />
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                    3
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Monitor Live</h4>
                    <p className="mt-1 text-slate-600">
                      Share read-only views with stakeholders or enable alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 opacity-70 blur-2xl" />
              <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-mono text-slate-400">device_config.json</div>
                </div>
                <div className="space-y-2 p-6 font-mono text-sm text-slate-600">
                  <div className="flex">
                    <span className="mr-2 text-purple-600">const</span>{" "}
                    <span className="text-blue-600">device</span> ={" "}
                    <span className="text-slate-800">new Client();</span>
                  </div>
                  <div className="flex text-slate-400">// Connect to cloud</div>
                  <div className="flex">
                    <span className="text-blue-600">device</span>.connect({"{"}
                    <span className="ml-2 text-emerald-600">protocol:</span>{" "}
                    <span className="text-amber-600">'mqtt'</span>
                    {"}"});
                  </div>
                  <div className="h-4" />
                  <div className="flex text-slate-400">// Send telemetry</div>
                  <div className="flex">
                    <span className="text-blue-600">device</span>.send({"{"}
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-800">temperature:</span>{" "}
                    <span className="text-blue-600">24.5</span>,
                  </div>
                  <div className="pl-4">
                    <span className="text-slate-800">status:</span>{" "}
                    <span className="text-amber-600">'nominal'</span>
                  </div>
                  <div className="flex">{"}"});</div>
                </div>
                <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 shadow-sm">
                  <CheckCircle2 className="h-4 w-4" /> Data Received
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-24 text-center" id="register">
        <span id="pricing" />
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-20 text-white shadow-2xl">
          <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/30 blur-3xl" />

          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Ready to build your control room?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-slate-400">
              Join thousands of developers connecting their devices today. No credit card required
              for the free tier.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link href="#register">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-slate-700 bg-transparent px-8 text-base text-white hover:bg-slate-800"
              >
                <Link href="#pricing">Compare Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
