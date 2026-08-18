import { FabricDetail } from "@/features/fabrics/fabric-detail";

export default async function FabricDetailPage({ params }: { params: Promise<{ fabricId: string }> }) { const { fabricId } = await params; return <FabricDetail id={fabricId} />; }
