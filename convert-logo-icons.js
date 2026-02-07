#!/usr/bin/env node
/**
 * SVG to PNG Icon Converter for Medisa Logo
 *
 * Bu scripti lokal bilgisayarınızda çalıştırın:
 * 1. npm install sharp
 * 2. node convert-logo-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'icon', 'favicon.svg');
const iconDir = path.join(__dirname, 'icon');

// PNG'ye dönüştürülecek boyutlar ve dosya adları
const icons = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-192-maskable.png', size: 192 },
  { name: 'icon-512-maskable.png', size: 512 }
];

async function convertIcons() {
  console.log('🎨 Medisa logo SVG\'den PNG\'ye dönüştürülüyor...\n');

  const svgBuffer = fs.readFileSync(svgPath);

  for (const icon of icons) {
    const outputPath = path.join(iconDir, icon.name);

    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${icon.name} (${icon.size}x${icon.size}) oluşturuldu`);
    } catch (error) {
      console.error(`❌ ${icon.name} oluşturulamadı:`, error.message);
    }
  }

  console.log('\n🎉 Tamamlandı!');
}

convertIcons().catch(console.error);
