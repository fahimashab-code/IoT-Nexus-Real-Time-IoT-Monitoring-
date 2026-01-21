import { Activity, BatteryCharging, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOverviewStats } from "@/services/mockData";
import { formatNumber } from "@/lib/utils";

export function StatsCards() {
  const stats = getOverviewStats();

  const items = [
    {
      title: "Active Devices",
      value: formatNumber(stats.activeDevices),
      icon: Activity,
    },
    {
      title: "Alerts Today",
      value: formatNumber(stats.alertsToday),
      icon: TriangleAlert,
    },
    {
      title: "Avg. Battery",
      value: `${stats.avgBattery}%`,
      icon: BatteryCharging,
    },
    {
      title: "Uptime",
      value: `${stats.uptime}%`,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{item.value}</div>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
