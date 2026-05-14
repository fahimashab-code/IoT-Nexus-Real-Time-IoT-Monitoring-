"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/UserNav";
import { useAppDispatch } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/slices/uiSlice";

export function Topbar() {
  const dispatch = useAppDispatch();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/90 px-4 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search devices, alerts..." className="pl-9" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground lg:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live monitoring
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
