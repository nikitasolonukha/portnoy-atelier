import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const script = path.join(root, "scripts", "3d", "build_modular_suit.py");

function findBlender() {
  const env = process.env.BLENDER_PATH;
  if (env && fs.existsSync(env)) return env;
  const candidates = [
    "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.4\\blender.exe",
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return "blender";
}

const blender = findBlender();
console.log(`Using Blender: ${blender}`);
const result = spawnSync(blender, ["--background", "--python", script], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
