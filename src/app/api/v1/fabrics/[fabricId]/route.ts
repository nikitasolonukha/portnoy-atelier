import { NextRequest, NextResponse } from "next/server";
import { FabricService } from "@/application/fabrics/fabric-service";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { apiSuccess } from "@/lib/api-response";
import { toErrorResponse } from "@/interface/http/respond";
import { fabricPatchSchema } from "@/schemas/fabric";

type Context = { params: Promise<{ fabricId: string }> };

export async function GET(_: NextRequest, context: Context) {
  try { await requireActor(); const { fabricId } = await context.params; const repositories = await getRepositories(); return NextResponse.json(apiSuccess(await new FabricService(repositories.fabrics).get(fabricId))); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}

export async function PATCH(request: NextRequest, context: Context) {
  try { const actor = await requireActor(); requireRole(actor, ["admin", "tailor"]); const { fabricId } = await context.params; const repositories = await getRepositories(); const updated = await repositories.fabrics.update(fabricId, fabricPatchSchema.parse(await request.json()), actor.id); if (!updated) return NextResponse.json({ error: { code: "fabric_not_found", message: "Ткань не найдена" } }, { status: 404 }); return NextResponse.json(apiSuccess(updated)); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}

export async function DELETE(_: NextRequest, context: Context) {
  try { const actor = await requireActor(); requireRole(actor, ["admin"]); const { fabricId } = await context.params; const repositories = await getRepositories(); await new FabricService(repositories.fabrics).remove(fabricId); return new NextResponse(null, { status: 204 }); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}
