const Database = require('better-sqlite3');
const db = new Database('data/pdfxpress.db');

const sscCat = db.prepare("SELECT id FROM categories WHERE slug = 'ssc'").get();
const otherCat = db.prepare("SELECT id FROM categories WHERE slug = 'other'").get();

// 1. Move SSC-specific PDFs BACK to SSC (they were wrongly moved to Other)
// These are SSC PYQ Series, SSC CGL T1 Hindi, CHSL papers - they belong to SSC, just subject should not be "Hindi"
const sscPdfs = db.prepare(`
  SELECT id, title FROM contents 
  WHERE (title LIKE 'SSC PYQ%' OR title LIKE 'SSC CGL%' OR title LIKE 'CHSL%')
    AND category_id = ?
`).all(otherCat.id);

console.log('Moving SSC PDFs back to SSC:', sscPdfs.length);
const moveToSSC = db.prepare("UPDATE contents SET category_id = ?, subject = 'General Awareness' WHERE id = ?");
for (const row of sscPdfs) {
  moveToSSC.run(sscCat.id, row.id);
  console.log(`  Back to SSC: ${row.title}`);
}

// 2. Move Pinnacle SSC books back to SSC with correct subjects
const pinnacleSSC = db.prepare(`
  SELECT id, title FROM contents 
  WHERE title LIKE 'Pinnacle%' 
    AND title NOT LIKE '%Railway%'
    AND title NOT LIKE '%RAILWAY%'
    AND category_id = ?
`).all(otherCat.id);

console.log('\nMoving Pinnacle SSC books back:', pinnacleSSC.length);
for (const row of pinnacleSSC) {
  let subject = 'General Awareness';
  const t = row.title.toLowerCase();
  if (t.includes('math')) subject = 'Mathematics';
  else if (t.includes('reasoning')) subject = 'Reasoning';
  else if (t.includes('english')) subject = 'English';
  else if (t.includes('gs') || t.includes('general')) subject = 'General Awareness';
  
  db.prepare("UPDATE contents SET category_id = ?, subject = ? WHERE id = ?")
    .run(sscCat.id, subject, row.id);
  console.log(`  Back to SSC [${subject}]: ${row.title}`);
}

// 3. The "Nidhi Mam General Hindi Notes" and "Lucent Hindi" are general books - keep them in Other, that's fine

// 4. Now remove "Hindi" from SSC exam page subjects (will be a code fix)
// Also fix: any content that has subject='Hindi' under SSC should become null subject
db.prepare("UPDATE contents SET subject = NULL WHERE subject = 'Hindi' AND category_id = ?").run(sscCat.id);

console.log('\nDone! SSC section is clean now.');
db.close();
