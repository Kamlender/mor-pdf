const Database = require('better-sqlite3');
const db = new Database('data/pdfxpress.db');

const rows = db.prepare("SELECT id, title, category_id, exam_id, subject FROM contents").all();

let updated = 0;

for (const row of rows) {
  const t = row.title.toLowerCase();
  let newSubject = row.subject;

  // Keyword matching for subjects
  if (t.includes('current affairs') || t.includes('करेन्ट') || t.includes('करेंट') || t.includes('वार्षिकांक') || t.includes('current')) {
    newSubject = 'Current Affairs';
  } else if (t.includes('math') || t.includes('गणित') || t.includes('trigonometry') || t.includes('geometry') || t.includes('arithmetic')) {
    newSubject = 'Mathematics';
  } else if (t.includes('reasoning') || t.includes('तर्कशक्ति')) {
    newSubject = 'Reasoning';
  } else if (t.includes('english') || t.includes('vocab') || t.includes('grammar') || t.includes('idioms') || t.includes('comprehension')) {
    newSubject = 'English';
  } else if (t.includes('science') || t.includes('विज्ञान') || t.includes('physics') || t.includes('भौतिक') || t.includes('chemistry') || t.includes('रसायन') || t.includes('biology') || t.includes('जीव') || t.includes('पादप') || t.includes('ऊर्जा')) {
    newSubject = 'Science';
  } else if (t.includes('history') || t.includes('इतिहास') || t.includes('मुगल') || t.includes('आंदोलन')) {
    newSubject = 'History';
  } else if (t.includes('geography') || t.includes('भूगोल') || t.includes('नदी') || t.includes('पर्वत')) {
    newSubject = 'Geography';
  } else if (t.includes('polity') || t.includes('संविधान') || t.includes('संसद') || t.includes('अनुच्छेद')) {
    newSubject = 'Polity';
  } else if (t.includes('economic') || t.includes('अर्थशास्त्र') || t.includes('बजट') || t.includes('आर्थिक') || t.includes('योजना')) {
    newSubject = 'Economics';
  } else if (t.includes('computer') || t.includes('कंप्यूटर')) {
    newSubject = 'Computer';
  } else if (t.includes('haryana gk') || t.includes('hr gk') || t.includes('हरियाणा') || t.match(/hssc.*gk/) || t.match(/haryana.*gk/)) {
    newSubject = 'Haryana GK';
  } else if (t.includes('hindi') || t.includes('हिन्दी') || t.includes('हिंदी')) {
    newSubject = 'Hindi';
  } else if (t.includes('gk') || t.includes('general knowledge') || t.includes('सामान्य ज्ञान') || t.includes('gs') || t.includes('general awareness') || t.includes('static') || t.includes('स्टेटिक')) {
    newSubject = 'General Awareness';
  } else if (t.includes('art & culture') || t.includes('नृत्य') || t.includes('कला') || t.includes('संस्कृति')) {
    newSubject = 'Art & Culture';
  }

  if (newSubject !== row.subject) {
    db.prepare("UPDATE contents SET subject = ? WHERE id = ?").run(newSubject, row.id);
    console.log(`Updated [${row.title}] -> ${newSubject}`);
    updated++;
  }
}

console.log(`\nReclassification complete! Updated ${updated} items.`);
db.close();
