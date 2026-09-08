import { readFileSync, writeFileSync } from "node:fs";
// Run only after the documented lossless mesh / WebP texture optimization.
for (const asset of ["velvet-sofa", "upholstered-chair"]) {
  const path = `public/space/assets/${asset}.glb`, bytes = readFileSync(path);
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2) throw new Error("Expected glTF2 GLB");
  const length = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + length).toString());
  if (asset === "velvet-sofa") {
    const champagne = json.materials.findIndex(m => m.name === "GlamVelvetSofa_fabric_champagne");
    if (champagne < 0) throw new Error("Reviewed Champagne variant missing");
    for (const mesh of json.meshes) for (const primitive of mesh.primitives) if (json.materials[primitive.material]?.name.startsWith("GlamVelvetSofa_fabric")) primitive.material = champagne;
  } else {
    // A documented sage recolor; original texture/normal/AO and geometry remain intact.
    for (const material of json.materials.filter(m => m.name.startsWith("fabric "))) {
      material.pbrMetallicRoughness.baseColorFactor = [.12, .16, .13, 1];
      material.extensions.KHR_materials_sheen.sheenColorFactor = [.40, .45, .36];
    }
  }
  const text = Buffer.from(JSON.stringify(json)), padded = Buffer.alloc(Math.ceil(text.length / 4) * 4, 0x20); text.copy(padded);
  const rest = bytes.subarray(20 + length), output = Buffer.alloc(20 + padded.length + rest.length);
  bytes.copy(output, 0, 0, 20); output.writeUInt32LE(output.length, 8); output.writeUInt32LE(padded.length, 12); padded.copy(output, 20); rest.copy(output, 20 + padded.length); writeFileSync(path, output);
}
