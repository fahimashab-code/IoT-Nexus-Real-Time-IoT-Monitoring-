import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { routes } from "@/config/routes";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (session) {
    redirect(routes.app.dashboard);
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
