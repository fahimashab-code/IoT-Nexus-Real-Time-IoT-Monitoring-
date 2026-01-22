import Link from "next/link";
import { Menu } from "lucide-react";
import { publicNav } from "@/config/nav";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href={routes.auth.login}>Login</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={routes.auth.register}>Get Started</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6">
                <Logo />
                <nav className="flex flex-col gap-4 text-sm">
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
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link href={routes.auth.login}>Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href={routes.auth.register}>Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
