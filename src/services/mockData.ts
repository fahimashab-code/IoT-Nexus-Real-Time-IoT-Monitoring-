import { buildAlerts, buildDevices, buildTelemetry } from "@/lib/mock-data-generator";
import type { Alert, Device, TelemetryPoint } from "@/types";

const devices = buildDevices(4);
const alerts = buildAlerts(10);

export function getDevices(): Device[] {
  return devices;
}

export function getDeviceById(deviceId: string): Device | undefined {
  return devices.find((device) => device.id === deviceId);
}

export function getAlerts(): Alert[] {
  return alerts;
}

export function getTelemetry(_: { deviceId?: string } = {}): TelemetryPoint[] {
  return buildTelemetry(24);
}

export function getOverviewStats() {
  return {
    activeDevices: devices.filter((device) => device.status === "online").length,
    alertsToday: alerts.length,
    avgBattery: Math.round(
      devices.reduce((sum, device) => sum + device.battery, 0) / devices.length,
    ),
    uptime: 99.2,
  };
}
