import type { SupabaseClient } from "@supabase/supabase-js";
import type { FabricImportLedger, ImportCounts } from "@/application/ports/fabric-import-ledger";
import { ApiProblem } from "@/lib/api-response";

export class SupabaseFabricImportLedger implements FabricImportLedger {
  constructor(private readonly client: SupabaseClient) {}

  async findCompleted(actorId: string, contentSha256: string) {
    const { data, error } = await this.client.from("fabric_imports").select("id").eq("created_by", actorId).eq("content_sha256", contentSha256).eq("status", "completed").maybeSingle();
    if (error) throw new ApiProblem("import_read_failed", "Не удалось проверить историю импорта", 500);
    return data?.id ?? null;
  }

  async start(input: { actorId: string; filename: string; strategy: "update" | "skip"; total: number; contentSha256: string }) {
    const { data, error } = await this.client.from("fabric_imports").insert({ filename: input.filename, status: "processing", total_rows: input.total, duplicate_strategy: input.strategy, content_sha256: input.contentSha256, created_by: input.actorId }).select("id").single();
    if (error || !data) throw new ApiProblem("import_start_failed", "Не удалось начать импорт", 500);
    return data.id;
  }

  async finish(id: string, counts: ImportCounts) {
    const { error } = await this.client.from("fabric_imports").update({
      status: "completed",
      valid_rows: counts.valid,
      invalid_rows: counts.invalid,
      created_rows: counts.created,
      updated_rows: counts.updated,
      skipped_rows: counts.skipped,
      failed_rows: counts.failed,
      finished_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw new ApiProblem("import_finish_failed", "Импорт выполнен, но итоговый журнал не сохранился", 500);
  }
}
