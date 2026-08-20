import fs from "node:fs";

const b = fs.readFileSync("public/models/suit-web-v2.glb");
const marker = Buffer.from('{"asset"');
const binType = 0x004e4942;

for (let i = 0; i < b.length - 8; i += 1) {
  if (b.readUInt32LE(i + 4) === binType) {
    const len = b.readUInt32LE(i);
    console.log("BIN @", i, "len", len, "end", i + 8 + len);
  }
}

console.log("json @", b.indexOf(marker));
console.log("file size", b.length);
