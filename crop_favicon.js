const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createFavicons() {
  const logoPath = path.join(__dirname, 'public/images/logo.png');
  const faviconIcoPath = path.join(__dirname, 'public/favicon.ico');
  const faviconPngPath = path.join(__dirname, 'public/favicon.png');

  try {
    // Generate favicon.png from the newly created logo.png
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(faviconPngPath);
    console.log('Saved favicon.png (32x32)');

    fs.copyFileSync(faviconPngPath, faviconIcoPath);
    console.log('Saved favicon.ico (copied from PNG)');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

createFavicons();
