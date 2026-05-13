"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DeviceDetailView } from "@/components/dashboard/DeviceDetailView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadOnboardedDevices, saveOnboardedDevices } from "@/lib/onboarding/store";
import { DEFAULT_IOT_ENDPOINT, DEFAULT_TOPIC_PATTERN } from "@/lib/onboarding/utils";
import { getDeviceById } from "@/services/mockData";
import type { Device } from "@/types";
import type { OnboardedDevice } from "@/lib/onboarding/types";

export default function DeviceDetailPage() {
  const params = useParams();
  const deviceId = useMemo(() => {
    if (!params?.deviceId) return "";
    return Array.isArray(params.deviceId) ? params.deviceId[0] : params.deviceId;
  }, [params]);
  const [device, setDevice] = useState<Device | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardedDevice | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    const fromMock = getDeviceById(deviceId);
    if (fromMock) {
      setDevice(fromMock);
      setOnboarding(null);
      setLoaded(true);
      return;
    }

    const onboarded = loadOnboardedDevices().find((item) => item.id === deviceId);
    if (onboarded) {
      const now = onboarded.createdAt ?? new Date().toISOString();
      setDevice({
        id: onboarded.id,
        name: onboarded.name,
        location: onboarded.location || "Unassigned",
        status: "online",
        firmware: onboarded.firmware || "v1.0.0",
        battery: 100,
        lastSeen: now,
        statusSince: now,
      });
      setOnboarding(onboarded);
      setLoaded(true);
      return;
    }

    setLoaded(true);
  }, [deviceId]);

  if (!loaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading device</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Fetching device details...
        </CardContent>
      </Card>
    );
  }

  if (!device) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>This device is not available yet. Return to the fleet list to pick another.</p>
          <Button asChild variant="outline">
            <Link href="/app/devices">Back to Devices</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSaveMetadata = (updates: {
    name: string;
    location: string;
    firmware: string;
    topicPattern?: string;
  }) => {
    if (!onboarding) return;
    const nextOnboarding: OnboardedDevice = {
      ...onboarding,
      name: updates.name,
      location: updates.location,
      firmware: updates.firmware,
      topicPattern: updates.topicPattern ?? onboarding.topicPattern,
      endpoint: onboarding.endpoint ?? DEFAULT_IOT_ENDPOINT,
    };
    const nextList = loadOnboardedDevices().map((item) =>
      item.id === onboarding.id ? nextOnboarding : item,
    );
    saveOnboardedDevices(nextList);
    setOnboarding(nextOnboarding);
    setDevice((prev) =>
      prev
        ? {
            ...prev,
            name: updates.name,
            location: updates.location,
            firmware: updates.firmware,
          }
        : prev,
    );
  };

  return (
    <DeviceDetailView
      device={device}
      onboarding={
        onboarding
          ? {
              endpoint: onboarding.endpoint ?? DEFAULT_IOT_ENDPOINT,
              topicPattern: onboarding.topicPattern || DEFAULT_TOPIC_PATTERN,
            }
          : undefined
      }
      onSaveMetadata={onboarding ? handleSaveMetadata : undefined}
    />
  );
}
