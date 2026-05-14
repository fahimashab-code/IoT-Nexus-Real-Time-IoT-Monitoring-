import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AlertSeverityBadge } from "@/components/alerts/AlertSeverityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { formatTimestamp } from "@/lib/utils";
import type { Alert } from "@/types";

interface RecentAlertsCardProps {
  alerts: Alert[];
}

export function RecentAlertsCard({ alerts }: RecentAlertsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{alert.deviceName}</p>
              <AlertSeverityBadge severity={alert.severity} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{alert.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatTimestamp(alert.timestamp)}
            </p>
          </div>
        ))}
        <Link
          href={routes.app.alerts}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all alerts
        </Link>
      </CardContent>
    </Card>
  );
}
