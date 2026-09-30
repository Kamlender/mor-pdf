const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/lib/auth/index.ts',
  'src/lib/classifier/index.ts',
  'src/lib/data.ts',
  'src/lib/db/index.ts',
  'src/lib/db/schema.ts',
  'src/lib/db/seed.ts',
];

// Regex for emojis: a simplified range that covers most standard emojis used
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{238C}\u{2B50}\u{23F3}]/gu;

filesToClean.forEach(file => {
  const filePath = path.join('c:/Users/PRINCE/Desktop/ZEX/PDF MORE/pdfxpress', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace em dashes with pipe or hyphen depending on context (usually in comments or strings)
    content = content.replace(/—/g, '|'); 
    // Remove emojis
    content = content.replace(emojiRegex, '');
    // Clean up empty spaces left by emojis in console logs
    content = content.replace(/console\.log\(`\s+/g, 'console.log(`');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
