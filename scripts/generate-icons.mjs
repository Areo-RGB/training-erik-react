import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = 'public/icons/icon-512x512.png';
const outputDir = 'public/icons';

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(sourceIcon)
      .resize(size, size)
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }
  
  // Generate Apple touch icon
  await sharp(sourceIcon)
    .resize(180, 180)
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');
  
  // Generate favicon
  await sharp(sourceIcon)
    .resize(32, 32)
    .toFile('public/favicon.ico');
  console.log('Generated: favicon.ico');
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
