import Link from "next/link";
import { Activity, ArrowUpRight, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

export function DashboardHeader() {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            Fleet operating normally
          </Badge>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Monitor device health, telemetry drift, and alert priority from one
              operator-focused view.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.app.alerts}>
              Review alerts
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={routes.app.devices}>
              <PlusCircle className="h-4 w-4" />
              Add device
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
