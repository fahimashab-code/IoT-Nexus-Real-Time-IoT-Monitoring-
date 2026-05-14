import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeviceStatus } from "@/types";

const statusClasses: Record<DeviceStatus, string> = {
  online: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  offline: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

export function DeviceStatusBadge({ status, className }: DeviceStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(statusClasses[status], className)}>
      {status}
    </Badge>
  );
}
