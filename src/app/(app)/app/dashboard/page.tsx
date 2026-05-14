import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentAlertsCard } from "@/components/dashboard/RecentAlertsCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { getAlerts } from "@/services/mockData";

export default function DashboardPage() {
  const alerts = getAlerts().slice(0, 4);

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <DashboardCharts />
        <RecentAlertsCard alerts={alerts} />
      </div>
    </div>
  );
}
