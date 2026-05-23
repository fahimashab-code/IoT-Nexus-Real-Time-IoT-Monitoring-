"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Cpu, Gauge, PanelLeft, Settings } from "lucide-react";
import { appNav } from "@/config/nav";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileSidebarOpen, toggleSidebar } from "@/store/slices/uiSlice";

const iconMap = {
  gauge: Gauge,
  cpu: Cpu,
  bell: Bell,
  settings: Settings,
} as const;

function SidebarNav() {
  const pathname = usePathname();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  return (
    <nav className={cn("flex flex-col gap-1.5", isCollapsed && "items-center")}>
      {!isCollapsed && (
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </p>
      )}
      {appNav.map((item) => {
        const Icon = iconMap[item.icon ?? "gauge"];
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "h-11 w-11 justify-center px-0",
            )}
          >
            {isActive && !isCollapsed ? (
              <span className="absolute left-0 h-6 w-1 rounded-r-full bg-primary-foreground/80" />
            ) : null}
            <Icon className={cn("h-5 w-5 shrink-0", isCollapsed && "h-6 w-6")} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const mobileOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen border-r bg-background p-4 md:flex md:flex-col",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-b border-border/60 pb-4",
            isCollapsed && "flex-col",
          )}
        >
          <Logo showText={false} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="mt-8">
          <SidebarNav />
        </div>
        <div className="mt-auto rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
          {isCollapsed ? (
            <div className="mx-auto h-2.5 w-2.5 rounded-full bg-emerald-500" />
          ) : (
            <>
              <p className="font-semibold text-foreground">Fleet Status</p>
              <p className="mt-1">96% devices reporting in the last hour.</p>
            </>
          )}
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="w-72 p-4">
          <Logo showText={false} />
          <div className="mt-8">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
