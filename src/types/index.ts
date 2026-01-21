export type DeviceStatus = "online" | "offline" | "warning";

export interface Device {
  id: string;
  name: string;
  status: DeviceStatus;
  location: string;
  lastSeen: string;
  statusSince: string;
  firmware: string;
  battery: number;
}

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
}

export interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  pressure: number;
  power: number;
  current: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Operator" | "Viewer";
}

export interface NavItem {
  label: string;
  href: string;
  icon?: "gauge" | "cpu" | "bell" | "settings";
}
