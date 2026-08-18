import { spawnSync } from "node:child_process";
import path from "node:path";

function executable(name) {
  return process.platform === "win32" ? `"${path.join(process.cwd(), "node_modules", ".bin", `${name}.cmd`)}"` : path.join(process.cwd(), "node_modules", ".bin", name);
}

function run(program, args, options = {}) {
  const result = spawnSync(program, args, { cwd: process.cwd(), encoding: "utf8", shell: process.platform === "win32", ...options });
  if (result.status !== 0) {
    if (options.stdio !== "inherit") process.stderr.write(result.error?.message || result.stderr || result.stdout || `${program} failed\n`);
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? "";
}

const supabase = executable("supabase");
let status = spawnSync(supabase, ["status", "-o", "env"], { cwd: process.cwd(), encoding: "utf8", shell: process.platform === "win32" });
if (status.status !== 0) {
  run(supabase, ["start"], { stdio: "inherit" });
  status = spawnSync(supabase, ["status", "-o", "env"], { cwd: process.cwd(), encoding: "utf8", shell: process.platform === "win32" });
}
if (status.status !== 0) {
  process.stderr.write("Local Supabase is unavailable. Start Docker and run pnpm db:start.\n");
  process.exit(status.status ?? 1);
}

const values = Object.fromEntries(status.stdout.split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([A-Z0-9_]+)=(?:"([^"]*)"|(.*))$/);
  return match ? [[match[1], match[2] ?? match[3] ?? ""]] : [];
}));
const required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"];
if (required.some((key) => !values[key])) {
  process.stderr.write("Supabase status did not provide the required local test credentials.\n");
  process.exit(1);
}

const env = { ...process.env, APP_MODE: "supabase", NEXT_PUBLIC_APP_MODE: "supabase", NEXT_PUBLIC_SUPABASE_URL: values.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: values.ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY };
run(executable("next"), ["build"], { env, stdio: "inherit" });
run(executable("playwright"), ["test", "--config=playwright.supabase.config.ts"], { env, stdio: "inherit" });
