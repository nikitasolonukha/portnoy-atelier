import fs from "node:fs";

const sourcePath = ".tmp-glb-check/public/models/suit-web-v2.glb";
const outPath = "public/models/suit-web-v2.glb";
const source = fs.readFileSync(sourcePath);
const marker = Buffer.from('{"asset"');

const jsonStart = source.indexOf(marker);
let depth = 0;
let jsonEnd = jsonStart;
for (let i = jsonStart; i < source.length; i += 1) {
  if (source[i] === 0x7b) depth += 1;
  if (source[i] === 0x7d) {
    depth -= 1;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }
}

const jsonBuffer = source.slice(jsonStart, jsonEnd);
JSON.parse(jsonBuffer.toString("utf8"));

const jsonChunkSize = 8 + jsonBuffer.length;
const jsonChunkPadded = Math.ceil(jsonChunkSize / 4) * 4;
const binStart = jsonStart - 8 + jsonChunkPadded;

// Use all bytes from binStart as one BIN chunk payload (strip chunk header if present).
let binPayloadStart = binStart;
if (source.readUInt32LE(binStart + 4) === 0x004e4942) {
  binPayloadStart = binStart + 8;
}

const binPayload = source.slice(binPayloadStart);
const binChunk = Buffer.alloc(8 + binPayload.length);
binChunk.writeUInt32LE(binPayload.length, 0);
binChunk.writeUInt32LE(0x004e4942, 4);
binPayload.copy(binChunk, 8);

const jsonChunk = Buffer.alloc(jsonChunkSize);
jsonChunk.writeUInt32LE(jsonBuffer.length, 0);
jsonChunk.writeUInt32LE(0x4e4f534a, 4);
jsonBuffer.copy(jsonChunk, 8);

const body = Buffer.concat([jsonChunk, binChunk]);
const out = Buffer.alloc(12 + body.length);
out.writeUInt32LE(0x46546c67, 0);
out.writeUInt32LE(2, 4);
out.writeUInt32LE(out.length, 8);
body.copy(out, 12);

fs.writeFileSync(outPath, out);
console.log(`Rebuilt GLB ${out.length} bytes (json ${jsonBuffer.length}, bin payload ${binPayload.length})`);
