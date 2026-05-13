import Link from "next/link";
import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Radar className="h-6 w-6" />
      </span>
      {showText ? <span className="text-lg tracking-tight">IoT Nexus</span> : null}
    </Link>
  );
}
