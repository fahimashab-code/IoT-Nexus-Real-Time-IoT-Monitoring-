import { AlertSeverityBadge } from "@/components/alerts/AlertSeverityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAlerts } from "@/services/mockData";
import { formatTimestamp } from "@/lib/utils";

export default function AlertsPage() {
  const alerts = getAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          Review recent incidents and prioritize response.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-lg border p-4">
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
