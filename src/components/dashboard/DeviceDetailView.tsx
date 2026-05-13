"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DeviceTelemetryChart } from "@/components/dashboard/DeviceTelemetryChart";
import { toast } from "@/components/ui/use-toast";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";
import { DEFAULT_IOT_ENDPOINT, DEFAULT_TOPIC_PATTERN, resolveTopicPattern } from "@/lib/onboarding/utils";
import type { Device } from "@/types";

interface DeviceDetailViewProps {
  device: Device;
  onboarding?: {
    endpoint?: string;
    topicPattern?: string;
  };
  onSaveMetadata?: (updates: {
    name: string;
    location: string;
    firmware: string;
    topicPattern?: string;
  }) => void;
}

export function DeviceDetailView({ device, onboarding, onSaveMetadata }: DeviceDetailViewProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [deviceState, setDeviceState] = useState(device);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const [editLocation, setEditLocation] = useState(device.location);
  const [editFirmware, setEditFirmware] = useState(device.firmware);
  const [topicPatternState, setTopicPatternState] = useState(
    onboarding?.topicPattern ?? DEFAULT_TOPIC_PATTERN,
  );
  const [editTopicPattern, setEditTopicPattern] = useState(
    onboarding?.topicPattern ?? DEFAULT_TOPIC_PATTERN,
  );
  const isSchemaLocked = Boolean(onboarding);

  useEffect(() => {
    setDeviceState(device);
    setEditName(device.name);
    setEditLocation(device.location);
    setEditFirmware(device.firmware);
    const nextPattern = onboarding?.topicPattern ?? DEFAULT_TOPIC_PATTERN;
    setEditTopicPattern(nextPattern);
    setTopicPatternState(nextPattern);
  }, [device, onboarding?.topicPattern]);

  const statusClasses: Record<Device["status"], string> = {
    online: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
    warning: "border-amber-500/40 text-amber-600 dark:text-amber-400",
    offline: "border-rose-500/40 text-rose-600 dark:text-rose-400",
  };

  const batteryColor =
    deviceState.battery < 20
      ? "bg-rose-500"
      : deviceState.battery < 40
        ? "bg-amber-500"
        : "bg-emerald-500";

  const handleSaveEdit = () => {
    const nextTopicPattern = editTopicPattern.trim() || DEFAULT_TOPIC_PATTERN;
    setDeviceState((prev) => ({
      ...prev,
      name: editName.trim() || prev.name,
      location: editLocation.trim() || prev.location,
      firmware: editFirmware.trim() || prev.firmware,
    }));
    setTopicPatternState(nextTopicPattern);
    if (onboarding) {
      onSaveMetadata?.({
        name: editName.trim() || deviceState.name,
        location: editLocation.trim() || deviceState.location,
        firmware: editFirmware.trim() || deviceState.firmware,
        topicPattern: nextTopicPattern,
      });
    }
    toast({
      title: "Device updated",
      description: "Saved locally.",
    });
    setEditOpen(false);
  };

  const endpoint = onboarding?.endpoint || DEFAULT_IOT_ENDPOINT;
  const resolvedTopic = resolveTopicPattern(topicPatternState, deviceState.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{deviceState.name}</h1>
          <Badge variant="outline" className={cn("rounded-full border", statusClasses[deviceState.status])}>
            {deviceState.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Live telemetry and device configuration details.</span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/60 sm:inline-flex" />
          <span className="text-xs uppercase tracking-[0.3em]">Updated just now</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Running {formatDuration(deviceState.statusSince)}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowDetails((prev) => !prev)}>
            {showDetails ? "Hide details" : "Show details"}
          </Button>
          <Button size="sm" onClick={() => setEditOpen(true)}>
            Edit metadata
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          showDetails ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-1",
        )}
      >
        <DeviceTelemetryChart deviceId={deviceState.id} compact={showDetails} />
        {showDetails ? (
          <div className="space-y-4 lg:max-w-[360px]">
            <Card className="border border-border bg-card shadow-sm">
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
                            deviceState.status === "online" && "bg-emerald-500",
                            deviceState.status === "warning" && "bg-amber-500",
                            deviceState.status === "offline" && "bg-rose-500",
                          )}
                        />
                        <span
                          className={cn(
                            "relative inline-flex h-2 w-2 rounded-full",
                            deviceState.status === "online" && "bg-emerald-500",
                            deviceState.status === "warning" && "bg-amber-500",
                            deviceState.status === "offline" && "bg-rose-500",
                          )}
                        />
                      </span>
                      <span className="capitalize">{deviceState.status}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Running for
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      {formatDuration(deviceState.statusSince)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-2 text-sm font-medium">{deviceState.location}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Battery
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", batteryColor)}
                          style={{ width: `${Math.min(deviceState.battery, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{deviceState.battery}%</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Firmware
                    </p>
                    <p className="mt-2 font-mono text-sm">{deviceState.firmware}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Last Seen
                    </p>
                    <p className="mt-2 text-sm">{formatTimestamp(deviceState.lastSeen)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Connection Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">MQTT endpoint</p>
                  <p className="mt-1 font-mono text-xs text-foreground">{endpoint}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em]">Publish topic</p>
                  <p className="mt-1 font-mono text-xs text-foreground">{resolvedTopic}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Data & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Real-time telemetry</p>
                  <p>Live chart stream with latest sensor updates.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Diagnostics & logs</p>
                  <p>View raw payload history and diagnostics (UI only).</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Edit metadata</p>
                  <p>Update name, location, and firmware tags.</p>
                </div>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  Edit device
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit device</DialogTitle>
            <DialogDescription>Update metadata fields (UI only).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Device name</label>
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={editLocation} onChange={(event) => setEditLocation(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Firmware</label>
              <Input value={editFirmware} onChange={(event) => setEditFirmware(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic pattern</label>
              <Input
                value={editTopicPattern}
                onChange={(event) => setEditTopicPattern(event.target.value)}
                placeholder={DEFAULT_TOPIC_PATTERN}
                disabled={isSchemaLocked}
              />
              <p className="text-xs text-muted-foreground">
                {isSchemaLocked
                  ? "Locked after onboarding."
                  : `Must include {deviceId} to resolve the publish topic.`}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
