import { NextRequest, NextResponse } from "next/server";
import { ConfigurationService } from "@/application/configurations/configuration-service";
import { requireActor } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { apiSuccess } from "@/lib/api-response";
import { configurationInputSchema } from "@/schemas/configuration";
import { toErrorResponse } from "@/interface/http/respond";

export async function GET() {
  try { const actor = await requireActor(); const repositories = await getRepositories(); return NextResponse.json(apiSuccess(await repositories.configurations.list(actor.id))); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}

export async function POST(request: NextRequest) {
  try { const actor = await requireActor(); const input = configurationInputSchema.parse(await request.json()); const repositories = await getRepositories(); const data = await new ConfigurationService(repositories.configurations, repositories.loadGroups).create(input, actor.id); return NextResponse.json(apiSuccess(data), { status: 201, headers: { Location: `/api/v1/configurations/${data.id}` } }); }
  catch (error) { const response = toErrorResponse(error); return NextResponse.json(response.body, { status: response.status }); }
}
