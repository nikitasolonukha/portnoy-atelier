import type { FabricImportLedger } from "@/application/ports/fabric-import-ledger";

export class DemoFabricImportLedger implements FabricImportLedger {
  async findCompleted() { return null; }
  async start() { return crypto.randomUUID(); }
  async finish() {}
}
