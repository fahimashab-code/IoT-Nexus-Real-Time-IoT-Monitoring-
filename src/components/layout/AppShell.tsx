"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Cpu,
  FlaskConical,
  SlidersHorizontal,
  Unplug,
  Zap,
} from "lucide-react";
import { useBench } from "@/components/bench/BenchProvider";

const navigation = [
  { href: "/", label: "Test bench", icon: Activity, number: "01" },
  { href: "/experiments", label: "Experiments", icon: FlaskConical, number: "02" },
  { href: "/settings", label: "Device settings", icon: SlidersHorizontal, number: "03" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { running } = useBench();
  const current = navigation.find((item) => item.href === pathname);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="IoT Nexus home">
          <span className="brand-mark">
            <Zap size={23} fill="currentColor" />
          </span>
          <span>
            nexus<span className="brand-dot">.</span>
            <small>EMBEDDED SYSTEMS LAB</small>
          </span>
        </Link>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="main-nav">
          {navigation.map(({ href, label, icon: Icon, number }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              <small>{number}</small>
            </Link>
          ))}
        </nav>
        <div className="sidebar-project">
          <span className="project-icon">
            <Cpu size={19} />
          </span>
          <div>
            <strong>One motor. Real questions.</strong>
            <p>Control, sensing & fault detection.</p>
          </div>
          <span className="project-tag">PROJECT 001</span>
        </div>
        <div className="sidebar-bottom">
          <div className="hardware-note">
            <Unplug size={16} />
            <span>Hardware not connected</span>
          </div>
          <p>
            Your workspace is ready.
            <br />
            Connect the ESP32 in the next stage.
          </p>
          <div className="sidebar-foot">
            <BookOpen size={14} />
            <span>IoT Nexus · Motor lab</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{current?.label ?? "Page not found"}</strong>
          </div>
          <div className="topbar-right">
            <span className={`status-dot ${running ? "pulsing" : ""}`} />
            <span>{running ? "Demo running" : "Demo workspace"}</span>
            <span className="version-label">PROTOTYPE</span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="workspace-footer">
          <span>
            IoT Nexus <span className="footer-separator">/</span> Embedded motor
            laboratory
          </span>
          <span>All measurements are simulated</span>
        </footer>
      </div>
    </div>
  );
}
