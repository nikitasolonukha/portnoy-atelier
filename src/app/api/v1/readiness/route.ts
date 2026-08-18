import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { toErrorResponse } from "@/interface/http/respond";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const env = getServerEnv();
    if (env.APP_MODE === "demo") return NextResponse.json(apiSuccess({ status: "ready", database: "demo-memory" }), { headers: { "Cache-Control": "no-store" } });
    const started = performance.now();
    const client = await createClient();
    const { error } = await client.from("configuration_groups").select("id").limit(1);
    if (error) throw error;
    return NextResponse.json(apiSuccess({ status: "ready", database: "ok", latencyMs: Math.round(performance.now() - started) }), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    toErrorResponse(error);
    return NextResponse.json({ error: { code: "not_ready", message: "Зависимости приложения недоступны" } }, { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
  }
}
