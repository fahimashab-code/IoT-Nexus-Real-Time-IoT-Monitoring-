import { AlertTriangle, BellRing, ShieldCheck, Siren } from "lucide-react";
import { AlertSeverityBadge } from "@/components/alerts/AlertSeverityBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAlerts } from "@/services/mockData";
import { formatTimestamp } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

export default function AlertsPage() {
  const alerts = getAlerts();
  const severityBorderClasses: Record<AlertSeverity, string> = {
    critical: "border-l-rose-500",
    high: "border-l-amber-500",
    medium: "border-l-sky-500",
    low: "border-l-emerald-500",
  };
  const alertSummary = [
    {
      label: "Critical",
      value: alerts.filter((alert) => alert.severity === "critical").length,
      icon: Siren,
      className: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "High priority",
      value: alerts.filter((alert) => alert.severity === "high").length,
      icon: AlertTriangle,
      className: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Open alerts",
      value: alerts.length,
      icon: BellRing,
      className: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Monitored",
      value: "24/7",
      icon: ShieldCheck,
      className: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Review recent incidents and prioritize response.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {alertSummary.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
              <span className="rounded-md bg-muted p-2">
                <item.icon className={`h-5 w-5 ${item.className}`} />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>
            Prioritized incidents with device context and report time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border border-l-4 p-4 transition-colors hover:bg-muted/40 ${severityBorderClasses[alert.severity]}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{alert.deviceName}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <AlertSeverityBadge severity={alert.severity} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatTimestamp(alert.timestamp)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
