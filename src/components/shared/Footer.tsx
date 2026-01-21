import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-start justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
        <p>
          {siteConfig.name} Copyright {new Date().getFullYear()} All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
