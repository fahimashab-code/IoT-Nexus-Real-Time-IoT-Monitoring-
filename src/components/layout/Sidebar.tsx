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
    <nav className="flex flex-col gap-1">
      {appNav.map((item) => {
        const Icon = iconMap[item.icon ?? "gauge"];
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.label}</span>}
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
        <div className={cn("flex items-center justify-between", isCollapsed && "flex-col gap-2")}>
          <Logo className={cn(isCollapsed && "flex-col text-xs")} />
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
          {!isCollapsed && (
            <>
              <p className="font-semibold text-foreground">Fleet Status</p>
              <p className="mt-1">96% devices reporting in the last hour.</p>
            </>
          )}
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => dispatch(setMobileSidebarOpen(open))}>
        <SheetContent side="left" className="w-72 p-4">
          <Logo />
          <div className="mt-8">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
