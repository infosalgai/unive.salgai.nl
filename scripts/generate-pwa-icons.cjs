/**
 * Generate PWA icons from public/icon.svg.
 * Run: node scripts/generate-pwa-icons.cjs
 * Requires: npm install sharp --save-dev
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "icon.svg");
const OUT_DIR = path.join(ROOT, "public", "icons");

const SIZES = [
  { size: 16, name: "icon-16.png" },
  { size: 32, name: "icon-32.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 192, name: "icon-maskable-192.png", maskable: true },
  { size: 512, name: "icon-maskable-512.png", maskable: true },
];

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error("Source icon not found:", SRC);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const svgBuffer = fs.readFileSync(SRC);
  const background = { r: 244, g: 245, b: 240, alpha: 1 }; // #F4F5F0

  for (const { size, name, maskable } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    if (maskable) {
      // Maskable: icon in center ~80% (safe zone), rest background
      const padding = Math.round(size * 0.1);
      const innerSize = size - 2 * padding;
      const resized = await sharp(svgBuffer)
        .resize(innerSize, innerSize)
        .png()
        .toBuffer();
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background,
        },
      })
        .composite([{ input: resized, left: padding, top: padding }])
        .png()
        .toFile(outPath);
    } else {
      await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
    }
    console.log("Generated:", name);
  }
  console.log("Done. Icons in public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
