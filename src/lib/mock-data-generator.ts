import type { Alert, AlertSeverity, Device, DeviceStatus, TelemetryPoint } from "@/types";

const locations = [
  "Warehouse A",
  "Warehouse B",
  "Cold Storage",
  "Plant 7",
  "Remote Field",
  "HQ Lab",
];

const severities: AlertSeverity[] = ["critical", "high", "medium", "low"];
const statuses: DeviceStatus[] = ["online", "warning", "offline"];

export function buildDevices(count = 18): Device[] {
  return Array.from({ length: count }).map((_, index) => {
    const status = statuses[index % statuses.length];
    return {
      id: `dev-${index + 1}`,
      name: `Sensor Node ${index + 1}`,
      status,
      location: locations[index % locations.length],
      lastSeen: new Date(Date.now() - index * 36e5).toISOString(),
      statusSince: new Date(Date.now() - (index + 2) * 18e5).toISOString(),
      firmware: `v${1 + (index % 3)}.${2 + (index % 5)}.${index % 10}`,
      battery: 65 + ((index * 7) % 30),
    };
  });
}

export function buildAlerts(count = 8): Alert[] {
  return Array.from({ length: count }).map((_, index) => ({
    id: `alert-${index + 1}`,
    deviceId: `dev-${(index % 6) + 1}`,
    deviceName: `Sensor Node ${(index % 6) + 1}`,
    severity: severities[index % severities.length],
    message: [
      "Overheat threshold exceeded",
      "Battery below 20%",
      "Signal degradation detected",
      "Humidity spike detected",
    ][index % 4],
    timestamp: new Date(Date.now() - index * 18e5).toISOString(),
  }));
}

export function buildTelemetry(points = 24): TelemetryPoint[] {
  const start = Date.now() - points * 36e5;
  return Array.from({ length: points }).map((_, index) => {
    const time = new Date(start + index * 36e5);
    const temperature = 22 + Math.sin(index / 4) * 4 + (index % 5) * 0.4;
    const pressure = 98 + Math.cos(index / 5) * 3 + (index % 4) * 0.5;
    const current = 6 + Math.sin(index / 3) * 1.4 + (index % 6) * 0.2;
    return {
      timestamp: time.toISOString(),
      temperature,
      pressure,
      current,
      power: 120 + current * 40,
    };
  });
}
