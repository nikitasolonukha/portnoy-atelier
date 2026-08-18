import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const generated = execFileSync(command, ["exec", "supabase", "gen", "types", "typescript", "--local", "--schema", "public"], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], shell: process.platform === "win32" });
const aliases = `

export type FabricRow = Database["public"]["Tables"]["fabrics"]["Row"]
export type FabricInsert = Database["public"]["Tables"]["fabrics"]["Insert"]
`;
writeFileSync("src/infrastructure/supabase/database.types.ts", generated.trimEnd() + aliases, "utf8");
