import type { NavItem } from "@/types";
import { routes } from "@/config/routes";

export const publicNav: NavItem[] = [
  { label: "Features", href: routes.public.home + "#features" },
  { label: "Pricing", href: routes.public.pricing },
  { label: "Login", href: routes.auth.login },
];

export const appNav: NavItem[] = [
  { label: "Dashboard", href: routes.app.dashboard, icon: "gauge" },
  { label: "Devices", href: routes.app.devices, icon: "cpu" },
  { label: "Alerts", href: routes.app.alerts, icon: "bell" },
  { label: "Settings", href: routes.app.settings, icon: "settings" },
];
