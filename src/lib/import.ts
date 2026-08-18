import { fabricInputSchema } from "@/schemas/fabric";

export function validateImportRows(rows: Record<string, unknown>[]) {
  const valid: Array<Record<string, unknown>> = [];
  const invalid: Array<{ row: number; issues: string[] }> = [];
  rows.forEach((row, index) => {
    const result = fabricInputSchema.safeParse(row);
    if (result.success) valid.push(result.data);
    else invalid.push({ row: index + 2, issues: [...new Set(result.error.issues.map((issue) => issue.message))] });
  });
  return { valid, invalid };
}
