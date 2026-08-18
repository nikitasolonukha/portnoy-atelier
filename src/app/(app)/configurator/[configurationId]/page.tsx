import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ configurationId: string }> }) {
  const { configurationId } = await params;
  redirect(`/configurator?id=${encodeURIComponent(configurationId)}`);
}
