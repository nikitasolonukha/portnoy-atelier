import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { executeFabricImport } from "@/application/import/execute-import";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { getRepositories } from "@/infrastructure/repositories";
import { toErrorResponse } from "@/interface/http/respond";
import { ApiProblem, apiSuccess } from "@/lib/api-response";
import { importRequestSchema } from "@/schemas/import";

export async function POST(request: NextRequest) {
  try {
    const actor = await requireActor();
    requireRole(actor, ["admin", "tailor"]);
    const input = importRequestSchema.parse(await request.json());
    const repositories = await getRepositories();
    const contentSha256 = createHash("sha256").update(JSON.stringify({ strategy: input.strategy, rows: input.rows })).digest("hex");
    if (await repositories.imports.findCompleted(actor.id, contentSha256)) throw new ApiProblem("import_already_completed", "Этот файл уже был успешно импортирован", 409);
    const importId = await repositories.imports.start({ actorId: actor.id, filename: input.filename, strategy: input.strategy, total: input.rows.length, contentSha256 });
    const result = await executeFabricImport(input.rows, input.strategy, repositories.fabrics, actor.id);
    const valid = result.created + result.updated + result.skipped;
    await repositories.imports.finish(importId, { total: input.rows.length, valid, invalid: result.failed, created: result.created, updated: result.updated, skipped: result.skipped, failed: result.failed });
    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
