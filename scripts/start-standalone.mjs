import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

function copyMissingTree(source, destination) {
  if (!existsSync(source)) return;
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) copyMissingTree(from, to);
    else if (!existsSync(to)) copyFileSync(from, to);
  }
}

if (!existsSync(".next/standalone/server.js")) throw new Error("Standalone build not found. Run pnpm build first.");
copyMissingTree("public", ".next/standalone/public");
copyMissingTree(".next/static", ".next/standalone/.next/static");
await import("../.next/standalone/server.js");