import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "public", "images", "bazaar", "gallery-source");
const outputDir = path.join(root, "public", "images", "bazaar", "gallery");
const views = ["front", "left", "back", "right"];

await fs.mkdir(outputDir, { recursive: true });

const files = (await fs.readdir(sourceDir)).filter((file) => file.endsWith("-sheet.png"));

for (const file of files) {
  const slug = file.replace(/-sheet\.png$/, "");
  const input = path.join(sourceDir, file);
  const metadata = await sharp(input).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  if (!halfWidth || !halfHeight) continue;

  const positions = [
    { left: 0, top: 0, width: halfWidth, height: halfHeight },
    { left: halfWidth, top: 0, width: width - halfWidth, height: halfHeight },
    { left: 0, top: halfHeight, width: halfWidth, height: height - halfHeight },
    { left: halfWidth, top: halfHeight, width: width - halfWidth, height: height - halfHeight },
  ];

  for (const [index, { left, top, width: cropWidth, height: cropHeight }] of positions.entries()) {
    await sharp(input)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(1200, 1200, { fit: "contain", position: "center", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(outputDir, `${slug}-${views[index]}.webp`));
  }
}

console.log(`Prepared ${files.length * views.length} bazaar gallery views from ${files.length} generated product turnarounds.`);
