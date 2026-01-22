import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="text-base font-semibold text-foreground">{siteConfig.name}</p>
          <p>
            Real-time visibility for distributed device fleets. Built for teams who need clarity,
            not noise.
          </p>
          <p className="text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product</p>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/app/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/app/devices" className="hover:text-foreground">
              Devices
            </Link>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Company</p>
          <div className="flex flex-col gap-2 text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Get started
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Contact sales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
