import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const glbPath = path.join(root, "public/models/suit-web-v2.glb");
const buffer = fs.readFileSync(glbPath);

let replacements = 0;
for (let i = 0; i < buffer.length - 2; i += 1) {
  if (buffer[i] === 0xef && buffer[i + 1] === 0xbf && buffer[i + 2] === 0xbd) {
    replacements += 1;
  }
}

const magic = buffer.slice(0, 4).toString("utf8");
const lengthField = buffer.readUInt32LE(8);

console.log(`File: ${glbPath}`);
console.log(`Size: ${buffer.length} bytes`);
console.log(`Magic: ${magic}`);
console.log(`Length field: ${lengthField}`);
console.log(`UTF-8 replacement sequences: ${replacements}`);

if (magic !== "glTF" || lengthField !== buffer.length) {
  console.error("\nGLB looks corrupted.");
  console.error("Download a fresh copy from:");
  console.error("https://sketchfab.com/3d-models/man-black-business-suit-7a669a06fb954d459985ccaa98672177");
  console.error("Save as public/models/suit-web-v2.glb and rebuild Docker.");
  process.exit(1);
}

console.log("\nGLB header looks valid.");
