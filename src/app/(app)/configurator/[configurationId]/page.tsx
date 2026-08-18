import { SuitConfigurator } from "@/features/configurator/suit-configurator-lifecycle";

export default async function Page({ params }: { params: Promise<{ configurationId: string }> }) {
  const { configurationId } = await params;
  return <SuitConfigurator configurationId={configurationId} />;
}
