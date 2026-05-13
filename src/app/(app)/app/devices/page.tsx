"use client";

import Link from "next/link";
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
