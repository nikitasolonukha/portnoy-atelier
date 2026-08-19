import { NextRequest, NextResponse } from "next/server";
import { FabricService } from "@/application/fabrics/fabric-service";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { apiSuccess } from "@/lib/api-response";
import { log } from "@/lib/logger";
import { fabricInputSchema } from "@/schemas/fabric";
import { fabricListQuerySchema } from "@/schemas/api";
import { toErrorResponse } from "@/interface/http/respond";

export async function GET(request: NextRequest) {
  try {
    await requireActor();
    const repositories = await getRepositories();
    const query = fabricListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await repositories.fabrics.list({ query: query.q, status: query.status, limit: query.limit, page: query.page });
    return NextResponse.json(apiSuccess(result.items, { page: query.page, limit: query.limit, total: result.total, hasMore: query.page * query.limit < result.total }));
  } catch (error) {
    const response = toErrorResponse(error); log("error", "fabrics.list_failed", { code: response.body.error.code });
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor(); requireRole(actor, ["admin", "tailor"]);
    const input = fabricInputSchema.parse(await request.json());
    const repositories = await getRepositories();
    const data = await new FabricService(repositories.fabrics).create(input, actor.id);
    return NextResponse.json(apiSuccess(data), { status: 201, headers: { Location: `/api/v1/fabrics/${data.id}` } });
  } catch (error) {
    const response = toErrorResponse(error); log("error", "fabrics.create_failed", { code: response.body.error.code });
    return NextResponse.json(response.body, { status: response.status });
  }
}
