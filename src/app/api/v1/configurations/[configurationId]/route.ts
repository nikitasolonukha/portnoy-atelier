import { NextRequest, NextResponse } from "next/server";
import { requireActor } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { apiSuccess } from "@/lib/api-response";
import { configurationInputSchema } from "@/schemas/configuration";
import { toErrorResponse } from "@/interface/http/respond";

type Context = { params: Promise<{ configurationId: string }> };

export async function GET(_: NextRequest, context: Context) {
  try {
    await requireActor();
    const { configurationId } = await context.params;
    const repositories = await getRepositories();
    const data = await repositories.configurations.findById(configurationId);
    if (!data) return NextResponse.json({ error: { code: "configuration_not_found", message: "Конфигурация не найдена" } }, { status: 404 });
    return NextResponse.json(apiSuccess(data));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try { const actor = await requireActor(); const { configurationId } = await context.params; const input = configurationInputSchema.partial().parse(await request.json()); const repositories = await getRepositories(); const data = await repositories.configurations.update(configurationId, input, actor.id); if (!data) return NextResponse.json({ error: { code: "configuration_not_found", message: "Конфигурация не найдена" } }, { status: 404 }); return NextResponse.json(apiSuccess(data)); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}

export async function DELETE(_: NextRequest, context: Context) {
  try { await requireActor(); const { configurationId } = await context.params; const repositories = await getRepositories(); if (!await repositories.configurations.remove(configurationId)) return NextResponse.json({ error: { code: "configuration_not_found", message: "Конфигурация не найдена" } }, { status: 404 }); return new NextResponse(null, { status: 204 }); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}
