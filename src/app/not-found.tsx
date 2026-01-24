"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(routes.app.dashboard);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-background p-6 text-center text-sm text-muted-foreground">
        Redirecting...
      </div>
    </div>
  );
}
