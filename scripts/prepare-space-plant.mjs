import { readFileSync, writeFileSync } from "node:fs";
// Offline preparation of the licensed Khronos DiffuseTransmissionPlant GLB.
// Download/source/license and exact shipped hash are recorded in the asset manifest.
// Usage: node scripts/prepare-space-plant.mjs source.glb stripped.glb
// Then gltf-transform optimize stripped.glb public/space/assets/indoor-plant.glb
// --compress quantize --texture-compress webp --texture-size 1024
// --simplify true --simplify-ratio 0.2 --simplify-error 0.01.
const [input, output] = process.argv.slice(2);
if (!input || !output || input === output) throw new Error("Provide separate source and output GLB paths");
const bytes = readFileSync(input);
if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2) throw new Error("Expected glTF2 GLB");
const length = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + length).toString());
if (json.nodes.slice(0, 3).map(node => node.name).join(",") !== "pot,leaves,dirt") throw new Error("Source asset changed; review before preparing");
json.scenes = [{ nodes: [0, 1, 2] }]; json.scene = 0; json.nodes = json.nodes.slice(0, 3);
for (const node of json.nodes) delete node.children;
delete json.animations; delete json.cameras;
if (json.extensions) delete json.extensions.KHR_lights_punctual;
json.extensionsUsed = (json.extensionsUsed ?? []).filter(name => name !== "KHR_lights_punctual");
const text = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(text.length / 4) * 4, 0x20); text.copy(padded);
const rest = bytes.subarray(20 + length), result = Buffer.alloc(20 + padded.length + rest.length);
bytes.copy(result, 0, 0, 20); result.writeUInt32LE(result.length, 8); result.writeUInt32LE(padded.length, 12); padded.copy(result, 20); rest.copy(result, 20 + padded.length); writeFileSync(output, result);
