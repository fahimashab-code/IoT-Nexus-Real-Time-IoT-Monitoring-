import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { routes } from "@/config/routes";
import { getAlerts } from "@/services/mockData";
import { formatTimestamp } from "@/lib/utils";

export default function DashboardPage() {
  const alerts = getAlerts().slice(0, 4);

  const severityClasses: Record<string, string> = {
    critical: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    medium: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live system health, telemetry, and alerts across your fleet.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <DashboardCharts />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.deviceName}</p>
                  <Badge variant="outline" className={severityClasses[alert.severity]}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatTimestamp(alert.timestamp)}
                </p>
              </div>
            ))}
            <Link href={routes.app.alerts} className="text-sm font-medium text-primary hover:underline">
              View all alerts
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


