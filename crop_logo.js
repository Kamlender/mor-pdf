const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage() {
  const inputPath = path.join(__dirname, 'public/images/peacock-feather.jpg');
  const logoPath = path.join(__dirname, 'public/images/logo.png');
  const faviconIcoPath = path.join(__dirname, 'public/favicon.ico');
  const faviconPngPath = path.join(__dirname, 'public/favicon.png');

  try {
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    
    // Crop the bottom text. Let's keep the top 68% of the image.
    const cropHeight = Math.floor(height * 0.68);
    
    // Calculate square dimensions
    const size = Math.min(width, cropHeight);
    const left = Math.floor((width - size) / 2);
    const top = 0; // Stick to the top since the feather starts from the top
    
    // Single extract to avoid Sharp pipeline errors
    await sharp(inputPath)
      .extract({ left, top, width: size, height: size })
      .png()
      .toFile(logoPath);

    console.log(`Saved logo.png (${size}x${size})`);

    // Generate favicons from the new logo
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(faviconPngPath);
    console.log('Saved favicon.png (32x32)');

    fs.copyFileSync(faviconPngPath, faviconIcoPath);
    console.log('Saved favicon.ico (copied from PNG)');

  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
