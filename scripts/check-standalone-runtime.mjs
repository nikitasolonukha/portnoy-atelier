import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const store = path.join(process.cwd(), ".next", "standalone", "node_modules", ".pnpm");
if (!existsSync(store)) throw new Error("Standalone pnpm runtime was not generated");
const helpers = readdirSync(store).find((entry) => entry.startsWith("@swc+helpers@"));
if (!helpers) throw new Error("Standalone runtime is missing @swc/helpers");
const esmHelper = path.join(store, helpers, "node_modules", "@swc", "helpers", "esm", "_interop_require_default.js");
if (!existsSync(esmHelper)) throw new Error("Standalone runtime is missing the Linux @swc/helpers ESM entrypoint");
process.stdout.write("Standalone runtime dependencies are self-contained.\n");
