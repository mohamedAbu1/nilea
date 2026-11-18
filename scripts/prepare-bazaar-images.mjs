import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public", "images", "bazaar", "source");
const fourKDir = path.join(root, "public", "images", "bazaar", "4k");
const webDir = path.join(root, "public", "images", "bazaar", "web");

await fs.mkdir(fourKDir, { recursive: true });
await fs.mkdir(webDir, { recursive: true });

const files = (await fs.readdir(sourceDir)).filter((file) => file.endsWith(".png"));

for (const file of files) {
  const name = path.basename(file, ".png");
  const input = path.join(sourceDir, file);
  await sharp(input)
    .resize(3840, 3840, { fit: "contain", position: "center", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(fourKDir, `${name}-4k.png`));
  await sharp(input)
    .resize(1200, 1200, { fit: "contain", position: "center", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(webDir, `${name}.webp`));
}

console.log(`Prepared ${files.length} transparent bazaar products in 4K PNG and web WebP formats.`);
