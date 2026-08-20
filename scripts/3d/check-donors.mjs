import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const donors = path.join(root, "assets", "3d", "donors");

const required = [
  ["suit-jacket", "Suit Jacket (single/notch)"],
  ["double-breasted-blazer", "Double-Breasted Formal Blazer"],
  ["fashionable-waistcoat", "A Fashionable Waistcoat"],
];

const optional = [
  ["classic-suit", "Classic suit (trousers)"],
  ["business-suit", "Business Suit"],
  ["clothing-kit-cc0", "Clothing kit CC0"],
];

function resolveDonor(stem) {
  const glb = path.join(donors, `${stem}.glb`);
  if (fs.existsSync(glb)) return glb;
  const folder = path.join(donors, stem);
  if (!fs.existsSync(folder)) return null;
  const preferred = ["scene.gltf", "scene.glb", `${stem}.gltf`, `${stem}.glb`];
  for (const name of preferred) {
    const candidate = path.join(folder, name);
    if (fs.existsSync(candidate)) return candidate;
  }
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const hit = walk(full);
        if (hit) return hit;
      } else if (/\.(gltf|glb)$/i.test(entry.name)) {
        return full;
      }
    }
    return null;
  };
  return walk(folder);
}

let missing = 0;
console.log("Phase-1 donors:\n");
for (const [stem, label] of required) {
  const hit = resolveDonor(stem);
  if (hit) {
    console.log(`  OK   ${stem} → ${path.relative(root, hit)} (${label})`);
  } else {
    missing += 1;
    console.log(`  MISS ${stem}  (${label})`);
  }
}

console.log("\nOptional:\n");
for (const [stem, label] of optional) {
  const hit = resolveDonor(stem);
  console.log(hit ? `  OK   ${stem} → ${path.relative(root, hit)}` : `  --   ${stem} (${label})`);
}

const modular = path.join(root, "public", "models", "suit-configurable-v3.glb");
console.log(`\nModular GLB: ${fs.existsSync(modular) ? "present" : "NOT BUILT"}`);

if (missing > 0) {
  console.log("\nDownload the MISS files from docs/3D_ATTRIBUTION.md (Sketchfab login required).");
  console.log("Then: pnpm 3d:build-modular");
  process.exit(2);
}

console.log("\nAll phase-1 donors present. Run: pnpm 3d:build-modular");
