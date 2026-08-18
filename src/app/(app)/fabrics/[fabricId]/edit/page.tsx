import { FabricForm } from "@/features/fabrics/fabric-form";

export default async function Page({ params }: { params: Promise<{ fabricId: string }> }) {
  const { fabricId } = await params;
  return <FabricForm fabricId={fabricId} />;
}
