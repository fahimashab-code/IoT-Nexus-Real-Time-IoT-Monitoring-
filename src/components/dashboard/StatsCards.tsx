import { Activity, BatteryCharging, ShieldCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOverviewStats } from "@/services/mockData";
import { cn, formatNumber } from "@/lib/utils";

export function StatsCards() {
  const stats = getOverviewStats();

  const items = [
    {
      title: "Active Devices",
      value: formatNumber(stats.activeDevices),
      detail: "Currently connected",
      trend: "Stable",
      icon: Activity,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Alerts Today",
      value: formatNumber(stats.alertsToday),
      detail: "Needs review",
      trend: "Open",
      icon: TriangleAlert,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Avg. Battery",
      value: `${stats.avgBattery}%`,
      detail: "Across online units",
      trend: "Healthy",
      icon: BatteryCharging,
      accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      title: "Uptime",
      value: `${stats.uptime}%`,
      detail: "Last 24 hours",
      trend: "SLA ready",
      icon: ShieldCheck,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="transition-colors hover:bg-muted/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <span className={cn("rounded-md p-2", item.accent)}>
              <item.icon className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-semibold">{item.value}</div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">{item.detail}</span>
              <span className="font-medium text-foreground">{item.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
