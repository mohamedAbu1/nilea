import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const villaRoot = path.join(root, "public", "images", "habu-sunset-villa");
const originalsDir = path.join(villaRoot, "originals");
const masterDir = path.join(villaRoot, "8k");
const responsiveDir = path.join(villaRoot, "responsive");

await fs.mkdir(masterDir, { recursive: true });
await fs.mkdir(responsiveDir, { recursive: true });

const originals = (await fs.readdir(originalsDir))
  .filter((file) => file.toLowerCase().endsWith(".png"))
  .sort();

for (const file of originals) {
  const source = path.join(originalsDir, file);
  const base = path.basename(file, path.extname(file));
  const image = sharp(source, { failOn: "none" });

  await image
    .clone()
    .resize({ width: 7680, height: 7680, fit: "inside", kernel: sharp.kernel.lanczos3, fastShrinkOnLoad: false })
    .sharpen({ sigma: 1.05, m1: 0.6, m2: 1.4 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(masterDir, `${base}-8k.png`));

  for (const [label, width] of [["desktop", 2400], ["tablet", 1600], ["mobile", 900]]) {
    await image
      .clone()
      .resize({ width, withoutEnlargement: false, fit: "inside", kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.2 })
      .webp({ quality: 88, effort: 6 })
      .toFile(path.join(responsiveDir, `${base}-${label}.webp`));
  }
}

await fs.writeFile(
  path.join(villaRoot, "README.md"),
  [
    "# Habu Sunset Villa image set",
    "",
    "- originals/: the 25 uploaded source images, unchanged.",
    "- 8k/: lossless PNG masters enlarged to a 7680px long edge with conservative sharpening.",
    "- responsive/: desktop (2400px), tablet (1600px), and mobile (900px) WebP delivery variants.",
    "",
    "The upscale is deterministic and content-preserving; it does not invent furniture, people, views, or architectural details.",
    "",
  ].join("\n"),
);

console.log(`Prepared ${originals.length} villa images in ${path.relative(root, villaRoot)}`);
