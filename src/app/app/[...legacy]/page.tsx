import { redirect } from "next/navigation";

export default async function LegacyPage({
  params,
}: {
  params: Promise<{ legacy: string[] }>;
}) {
  const { legacy } = await params;
  redirect(legacy[0] === "settings" ? "/settings" : "/");
}
