import Link from "next/link";
import { publicNav } from "@/config/nav";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href={routes.auth.login}>Login</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={routes.auth.register}>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
