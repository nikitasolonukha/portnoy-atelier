import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { resetDemoData } from "@/infrastructure/demo/demo-repositories";

export async function POST() {
  const env = getServerEnv();
  if (env.APP_MODE !== "demo") {
    return NextResponse.json({ error: { code: "not_demo", message: "Доступно только в демо-режиме" } }, { status: 403 });
  }
  resetDemoData();
  return NextResponse.json({ data: { message: "Демо-данные сброшены" } });
}
