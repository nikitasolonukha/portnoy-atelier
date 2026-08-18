export type ImportCounts = {
  total: number;
  valid: number;
  invalid: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

export interface FabricImportLedger {
  findCompleted(actorId: string, contentSha256: string): Promise<string | null>;
  start(input: { actorId: string; filename: string; strategy: "update" | "skip"; total: number; contentSha256: string }): Promise<string>;
  finish(id: string, counts: ImportCounts): Promise<void>;
}
