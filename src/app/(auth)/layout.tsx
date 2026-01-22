import { ShieldCheck, Sparkles, Timer } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
          <div className="relative z-10 space-y-8">
            <Logo className="text-white" />
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Secure IoT operations
              </p>
              <h1 className="text-3xl font-semibold leading-tight">
                Keep every device, alert, and workflow in a single control plane.
              </h1>
              <p className="text-sm text-white/70">
                Built for operators who need a fast signal from large device fleets, without
                context switching.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-white/70">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-semibold text-white">Role-based access</p>
                  <p>Separate operators, admins, and viewers with confidence.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Timer className="mt-1 h-5 w-5 text-blue-300" />
                <div>
                  <p className="font-semibold text-white">Live telemetry focus</p>
                  <p>Use configurable gauges and trends for immediate context.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Sparkles className="mt-1 h-5 w-5 text-purple-300" />
                <div>
                  <p className="font-semibold text-white">Portfolio-ready UI</p>
                  <p>Design polish that feels like a production tool.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 text-xs text-white/50">
            Need access? Contact support@iotnexus.dev
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </main>
    </div>
  );
}
