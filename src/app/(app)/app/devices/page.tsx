"use client";

import Link from "next/link";
import { Activity, BatteryCharging, CircleOff, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DeviceTable } from "@/components/dashboard/DeviceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDevices } from "@/services/mockData";
import type { Device } from "@/types";
import type { OnboardedDevice } from "@/lib/onboarding/types";
import { loadOnboardedDevices } from "@/lib/onboarding/store";

export default function DevicesPage() {
  const [onboardedDevices, setOnboardedDevices] = useState<OnboardedDevice[]>([]);

  useEffect(() => {
    setOnboardedDevices(loadOnboardedDevices());
  }, []);

  const mapOnboardedToDevice = (device: OnboardedDevice): Device => ({
    id: device.id,
    name: device.name,
    location: device.location || "Unassigned",
    status: "online",
    firmware: device.firmware || "v1.0.0",
    battery: 100,
    lastSeen: device.createdAt,
    statusSince: device.createdAt,
  });

  const devices = useMemo(() => {
    const onboardedIds = new Set(onboardedDevices.map((device) => device.id));
    const base = getDevices().filter((device) => !onboardedIds.has(device.id));
    return [...onboardedDevices.map(mapOnboardedToDevice), ...base];
  }, [onboardedDevices]);

  const averageBattery = devices.length
    ? Math.round(devices.reduce((sum, device) => sum + device.battery, 0) / devices.length)
    : 0;

  const summaryCards = [
    {
      label: "Online",
      value: devices.filter((device) => device.status === "online").length,
      icon: Activity,
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Warnings",
      value: devices.filter((device) => device.status === "warning").length,
      icon: TriangleAlert,
      className: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Offline",
      value: devices.filter((device) => device.status === "offline").length,
      icon: CircleOff,
      className: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Avg. battery",
      value: `${averageBattery}%`,
      icon: BatteryCharging,
      className: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Devices</h1>
          <p className="text-sm text-muted-foreground">
            Track device status, firmware, and battery health across the fleet.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/app/devices/onboard">Onboard device</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              </div>
              <span className="rounded-md bg-muted p-2">
                <card.icon className={`h-5 w-5 ${card.className}`} />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceTable devices={devices} />
        </CardContent>
      </Card>
    </div>
  );
}
