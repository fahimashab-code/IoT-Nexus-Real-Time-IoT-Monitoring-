import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types";

const severityClasses: Record<AlertSeverity, string> = {
  critical: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  medium: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

interface AlertSeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

export function AlertSeverityBadge({ severity, className }: AlertSeverityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(severityClasses[severity], className)}>
      {severity}
    </Badge>
  );
}
