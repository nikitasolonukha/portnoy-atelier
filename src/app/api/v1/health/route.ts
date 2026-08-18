import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getServerEnv();
  return NextResponse.json(apiSuccess({ status: "ok", mode: env.APP_MODE, version: env.APP_VERSION, timestamp: new Date().toISOString() }), { headers: { "Cache-Control": "no-store" } });
}
