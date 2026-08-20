import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const standaloneRoot = path.join(process.cwd(), ".next", "standalone");
if (!existsSync(standaloneRoot)) throw new Error("Standalone output was not generated");

const pnpmStore = path.join(standaloneRoot, "node_modules", ".pnpm");
const hoistedHelper = path.join(standaloneRoot, "node_modules", "@swc", "helpers", "esm", "_interop_require_default.js");

if (existsSync(pnpmStore)) {
  const helpers = readdirSync(pnpmStore).find((entry) => entry.startsWith("@swc+helpers@"));
  if (!helpers) throw new Error("Standalone runtime is missing @swc/helpers");
  const esmHelper = path.join(pnpmStore, helpers, "node_modules", "@swc", "helpers", "esm", "_interop_require_default.js");
  if (!existsSync(esmHelper)) throw new Error("Standalone runtime is missing the Linux @swc/helpers ESM entrypoint");
  process.stdout.write("Standalone runtime dependencies are self-contained.\n");
} else if (existsSync(hoistedHelper)) {
  // node-linker=hoisted flattens the standalone tree; Docker still needs the traced helpers.
  process.stdout.write("Standalone runtime dependencies are self-contained (hoisted linker).\n");
} else {
  throw new Error("Standalone pnpm runtime was not generated");
}
