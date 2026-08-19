import { spawnSync } from "node:child_process";
import path from "node:path";

function executable(name) {
  return process.platform === "win32" ? `"${path.join(process.cwd(), "node_modules", ".bin", `${name}.cmd`)}"` : path.join(process.cwd(), "node_modules", ".bin", name);
}

function run(program, args, env) {
  const result = spawnSync(program, args, { cwd: process.cwd(), encoding: "utf8", shell: process.platform === "win32", env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const env = { ...process.env, APP_MODE: "demo", NEXT_PUBLIC_APP_MODE: "demo" };
run(executable("next"), ["build"], env);
run(executable("playwright"), ["test", "--config=playwright.production.config.ts"], env);