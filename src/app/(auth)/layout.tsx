export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
