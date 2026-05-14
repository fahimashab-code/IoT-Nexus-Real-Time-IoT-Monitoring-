import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { AlertSeverityBadge } from "@/components/alerts/AlertSeverityBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";
import { formatTimestamp } from "@/lib/utils";
import type { Alert } from "@/types";

interface RecentAlertsCardProps {
  alerts: Alert[];
}

export function RecentAlertsCard({ alerts }: RecentAlertsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Highest priority incidents from the fleet.</CardDescription>
        </div>
        <span className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No active alerts right now.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-lg border bg-background p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium">{alert.deviceName}</p>
                <AlertSeverityBadge severity={alert.severity} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {alert.message}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatTimestamp(alert.timestamp)}
              </p>
            </div>
          ))
        )}
        <Link
          href={routes.app.alerts}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all alerts
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
