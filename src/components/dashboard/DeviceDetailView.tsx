"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceTelemetryChart } from "@/components/dashboard/DeviceTelemetryChart";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";
import type { Device } from "@/types";

interface DeviceDetailViewProps {
  device: Device;
}

export function DeviceDetailView({ device }: DeviceDetailViewProps) {
  const [showDetails, setShowDetails] = useState(true);

  const statusClasses: Record<Device["status"], string> = {
    online: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
    warning: "border-amber-500/40 text-amber-600 dark:text-amber-400",
    offline: "border-rose-500/40 text-rose-600 dark:text-rose-400",
  };

  const batteryColor =
    device.battery < 20
      ? "bg-rose-500"
      : device.battery < 40
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{device.name}</h1>
          <Badge variant="outline" className={cn("rounded-full border", statusClasses[device.status])}>
            {device.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Live telemetry and device configuration details.</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/60 sm:inline-flex" />
          <span className="text-xs uppercase tracking-[0.3em]">Updated just now</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Running {formatDuration(device.statusSince)}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowDetails((prev) => !prev)}>
            {showDetails ? "Hide details" : "Show details"}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          showDetails ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-1",
        )}
      >
        <DeviceTelemetryChart deviceId={device.id} compact={showDetails} />
        {showDetails ? (
          <Card className="border border-border bg-card shadow-sm lg:max-w-[360px]">
            <CardHeader>
              <CardTitle>Device Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-40",
                          device.status === "online" && "bg-emerald-500",
                          device.status === "warning" && "bg-amber-500",
                          device.status === "offline" && "bg-rose-500",
                        )}
                      />
                      <span
                        className={cn(
                          "relative inline-flex h-2 w-2 rounded-full",
                          device.status === "online" && "bg-emerald-500",
                          device.status === "warning" && "bg-amber-500",
                          device.status === "offline" && "bg-rose-500",
                        )}
                      />
                    </span>
                    <span className="capitalize">{device.status}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Running for
                  </p>
                  <p className="mt-2 font-mono text-sm font-semibold">
                    {formatDuration(device.statusSince)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-2 text-sm font-medium">{device.location}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Battery
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", batteryColor)}
                        style={{ width: `${Math.min(device.battery, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm">{device.battery}%</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Firmware
                  </p>
                  <p className="mt-2 font-mono text-sm">{device.firmware}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Last Seen
                  </p>
                  <p className="mt-2 text-sm">{formatTimestamp(device.lastSeen)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
