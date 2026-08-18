import { NextResponse } from "next/server";
import { requireActor } from "@/infrastructure/auth/actor";
import { toErrorResponse } from "@/interface/http/respond";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  try {
    return NextResponse.json(apiSuccess(await requireActor()));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
