"use client";

import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/UserNav";
import { useAppDispatch } from "@/store/hooks";
import { setMobileSidebarOpen } from "@/store/slices/uiSlice";

export function Topbar() {
  const dispatch = useAppDispatch();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => dispatch(setMobileSidebarOpen(true))}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search devices..." className="pl-9" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
