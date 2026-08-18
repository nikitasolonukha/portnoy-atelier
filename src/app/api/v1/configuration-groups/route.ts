import { NextResponse } from "next/server";
import { requireActor } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { toErrorResponse } from "@/interface/http/respond";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  try {
    await requireActor();
    const repositories = await getRepositories();
    const groups = await repositories.loadGroups();
    return NextResponse.json(apiSuccess(groups, { count: groups.length }));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
