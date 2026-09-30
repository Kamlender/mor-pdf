/**
 * PDF Import Script for PdfXpress
 * Analyzes PDF filenames, classifies by exam & subject, copies to public/uploads, seeds DB.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PDF_SOURCE = path.join(__dirname, '..', 'PDF and BOOKS');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const DB_PATH = path.join(__dirname, 'data', 'pdfxpress.db');

// ─── Ensure directories exist ───
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// ─── Get existing categories & exams ───
const allCategories = sqlite.prepare('SELECT * FROM categories WHERE is_active = 1').all();
const allExams = sqlite.prepare('SELECT * FROM exams WHERE is_active = 1').all();

function getCategoryId(slug) {
  const c = allCategories.find(cat => cat.slug === slug);
  return c ? c.id : null;
}

function getExamId(slug, categorySlug) {
  const catId = getCategoryId(categorySlug);
  if (!catId) return null;
  const e = allExams.find(ex => ex.slug === slug && ex.category_id === catId);
  return e ? e.id : null;
}

// Also check if HSSC/Haryana exams exist, if not create them
let hsscExamId = null;
const stateExamsCat = getCategoryId('state-exams');
if (stateExamsCat) {
  // Check if HSSC exam exists
  let hssc = allExams.find(e => e.slug === 'hssc' && e.category_id === stateExamsCat);
  if (!hssc) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'HSSC', 'hssc', 'Haryana Staff Selection Commission');
      hsscExamId = id;
      allExams.push({ id, category_id: stateExamsCat, slug: 'hssc', name: 'HSSC' });
    } catch(e) { /* already exists */ }
  } else {
    hsscExamId = hssc.id;
  }

  // Haryana Police
  let hrPolice = allExams.find(e => e.slug === 'haryana-police' && e.category_id === stateExamsCat);
  if (!hrPolice) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'Haryana Police', 'haryana-police', 'Haryana Police Constable / SI Examination');
      allExams.push({ id, category_id: stateExamsCat, slug: 'haryana-police', name: 'Haryana Police' });
    } catch(e) {}
  }

  // Delhi Police
  let delhiPolice = allExams.find(e => e.slug === 'delhi-police' && e.category_id === stateExamsCat);
  if (!delhiPolice) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'Delhi Police', 'delhi-police', 'Delhi Police Constable / SI / Head Constable Examination');
      allExams.push({ id, category_id: stateExamsCat, slug: 'delhi-police', name: 'Delhi Police' });
    } catch(e) {}
  }

  // DSSSB
  let dsssb = allExams.find(e => e.slug === 'dsssb' && e.category_id === stateExamsCat);
  if (!dsssb) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'DSSSB', 'dsssb', 'Delhi Subordinate Services Selection Board');
      allExams.push({ id, category_id: stateExamsCat, slug: 'dsssb', name: 'DSSSB' });
    } catch(e) {}
  }

  // HTET
  let htet = allExams.find(e => e.slug === 'htet' && e.category_id === stateExamsCat);
  if (!htet) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'HTET', 'htet', 'Haryana Teacher Eligibility Test');
      allExams.push({ id, category_id: stateExamsCat, slug: 'htet', name: 'HTET' });
    } catch(e) {}
  }

  // REET
  let reet = allExams.find(e => e.slug === 'reet' && e.category_id === stateExamsCat);
  if (!reet) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'REET', 'reet', 'Rajasthan Eligibility Examination for Teachers');
      allExams.push({ id, category_id: stateExamsCat, slug: 'reet', name: 'REET' });
    } catch(e) {}
  }

  // CRPF
  let crpf = allExams.find(e => e.slug === 'crpf' && e.category_id === stateExamsCat);
  if (!crpf) {
    const id = crypto.randomUUID();
    try {
      sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
        .run(id, stateExamsCat, 'CRPF', 'crpf', 'Central Reserve Police Force');
      allExams.push({ id, category_id: stateExamsCat, slug: 'crpf', name: 'CRPF' });
    } catch(e) {}
  }

  // RPF
  let rpf = allExams.find(e => e.slug === 'rpf' && e.category_id === 'railway');
  // Add RPF under railway
  const railwayCat = getCategoryId('railway');
  if (railwayCat) {
    let rpfExam = allExams.find(e => e.slug === 'rpf' && e.category_id === railwayCat);
    if (!rpfExam) {
      const id = crypto.randomUUID();
      try {
        sqlite.prepare('INSERT INTO exams (id, category_id, name, slug, description, is_active) VALUES (?, ?, ?, ?, ?, 1)')
          .run(id, railwayCat, 'RPF', 'rpf', 'Railway Protection Force');
        allExams.push({ id, category_id: railwayCat, slug: 'rpf', name: 'RPF' });
      } catch(e) {}
    }
  }
}

// ─── Classification Rules ───
function classifyPdf(filename) {
  const fn = filename.toLowerCase();
  const fnOrig = filename;

  let categorySlug = 'other';
  let examSlug = null;
  let subject = null;
  let contentType = 'EXAM_PDF';
  let language = 'Hindi';
  let title = filename.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();

  // Determine language
  if (fn.includes('english') || fn.includes('eng ') || fn.includes('eng_')) {
    language = 'English';
  }

  // ─── ANSWER KEYS ───
  if (fn.includes('answer key') || fn.includes('answerkey') || fn.includes('answer_key') || fn.includes('answer-key')) {
    contentType = 'ANSWER_KEY';
  }

  // ─── PRACTICE SETS ───
  if (fn.includes('practice set') || fn.includes('practice_set') || fn.includes('mock test') || fn.includes('test -') || fn.includes('test-')) {
    contentType = 'PRACTICE_SET';
  }

  // ─── BOOKS ───
  if (fn.includes('book') || fn.includes('lucent') || fn.includes('pinnacle') || fn.includes('arihant') || 
      fn.includes('speedy') || fn.includes('yct') || fn.includes('ncert') || fn.includes('concept king') ||
      fn.includes('practice king') || fn.includes('fatman') || fn.includes('black book') || fn.includes('blackbook') ||
      fn.includes('neetu singh') || fn.includes('rakesh yadav') || fn.includes('disha') || fn.includes('khan sir') ||
      fn.includes('sk jha') || fn.includes('ramban') || fn.includes('kiran')) {
    contentType = 'BOOK';
  }

  // ─── SSC ───
  if (fn.includes('ssc') || fn.includes('cgl') || fn.includes('chsl') || fn.includes('mts') || 
      fn.includes('ssc gd') || fn.includes('cpo') || fn.includes('stenographer')) {
    categorySlug = 'ssc';
    if (fn.includes('cgl')) examSlug = 'cgl';
    else if (fn.includes('chsl')) examSlug = 'chsl';
    else if (fn.includes('mts')) examSlug = 'mts';
    else if (fn.includes('ssc gd') || fn.includes('ssc_gd') || fn.includes('gd constable')) examSlug = 'gd';
    else if (fn.includes('cpo')) examSlug = 'cpo';
    else if (fn.includes('stenographer')) examSlug = 'stenographer';
  }

  // ─── RAILWAY ───
  if (fn.includes('railway') || fn.includes('rrb') || fn.includes('ntpc') || fn.includes('group d') || 
      fn.includes('group_d') || fn.includes('alp') || fn.includes('rpf') || fn.includes('rwa') ||
      fn.includes('rail ') || fn.includes('rail_')) {
    categorySlug = 'railway';
    if (fn.includes('ntpc') || fn.includes('nptc')) examSlug = 'ntpc';
    else if (fn.includes('group d') || fn.includes('group_d') || fn.includes('ग्रुप_d') || fn.includes('ग्रुप d')) examSlug = 'group-d';
    else if (fn.includes('alp')) examSlug = 'alp';
    else if (fn.includes(' je ') || fn.includes('_je_') || fn.includes('je ')) examSlug = 'je';
    else if (fn.includes('rpf')) examSlug = 'rpf';
  }

  // ─── HARYANA / HSSC / STATE ───
  if (fn.includes('haryana') || fn.includes('hssc') || fn.includes('hr gk') || fn.includes('hr police') || 
      fn.includes('hr_') || fn.includes('htet') || fn.includes('sunil boora') || fn.includes('study mantra')) {
    categorySlug = 'state-exams';
    if (fn.includes('police') || fn.includes('constable')) examSlug = 'haryana-police';
    else if (fn.includes('hssc') || fn.includes('cet')) examSlug = 'hssc';
    else if (fn.includes('htet')) examSlug = 'htet';
    else if (fn.includes('high court') || fn.includes('clerk')) examSlug = 'hssc';
    else examSlug = 'hssc';
  }

  // ─── DELHI POLICE ───
  if (fn.includes('delhi police')) {
    categorySlug = 'state-exams';
    examSlug = 'delhi-police';
  }

  // ─── DSSSB ───
  if (fn.includes('dsssb')) {
    categorySlug = 'state-exams';
    examSlug = 'dsssb';
  }

  // ─── CRPF ───
  if (fn.includes('crpf')) {
    categorySlug = 'state-exams';
    examSlug = 'crpf';
  }

  // ─── REET ───
  if (fn.includes('reet')) {
    categorySlug = 'state-exams';
    examSlug = 'reet';
  }

  // ─── UPPSC ───
  if (fn.includes('uppcs') || fn.includes('uppsc')) {
    categorySlug = 'state-exams';
    examSlug = 'uppsc';
  }

  // ─── SUBJECT DETECTION ───
  if (fn.includes('math') || fn.includes('maths') || fn.includes('गणित') || fn.includes('algebra') || 
      fn.includes('geomatry') || fn.includes('geometry') || fn.includes('trigonometry') || fn.includes('mensuration') ||
      fn.includes('percentage') || fn.includes('profit') || fn.includes('average') || fn.includes('ratio') ||
      fn.includes('simplification') || fn.includes('number system') || fn.includes('lcm') || fn.includes('hcf') ||
      fn.includes('coordinate') || fn.includes('equation') || fn.includes('surds') || fn.includes('statistics') ||
      fn.includes('probability') || fn.includes('discount') || fn.includes('installment') || fn.includes('partnership') ||
      fn.includes('time speed') || fn.includes('time & work') || fn.includes('ci & si') || fn.includes('ci.pdf') ||
      fn.includes('si.pdf') || fn.includes('ap gp hp') || fn.includes('height & distance') ||
      fn.includes('permutation') || fn.includes('mixture')) {
    subject = 'Mathematics';
  } else if (fn.includes('reasoning') || fn.includes('number series')) {
    subject = 'Reasoning';
  } else if (fn.includes('english') || fn.includes('vocab') || fn.includes('idiom') || fn.includes('grammar') ||
             fn.includes('eng ') || fn.includes('eng_') || fn.includes('english language') || fn.includes('neetu singh') ||
             fn.includes('pinnacl english') || fn.includes('pinnacle english')) {
    subject = 'English';
  } else if (fn.includes('biology') || fn.includes('bio') || fn.includes('genetics') || fn.includes('evolution') ||
             fn.includes('cell') || fn.includes('disease') || fn.includes('रोग')) {
    subject = 'Science';
  } else if (fn.includes('chemistry') || fn.includes('chemical') || fn.includes('oxidation') || fn.includes('mole.pdf') ||
             fn.includes('electronic configuration') || fn.includes('atomic mass') || fn.includes('gas law') ||
             fn.includes('heat.pdf') || fn.includes('temperature') || fn.includes('magnetism') || fn.includes('fleming')) {
    subject = 'Science';
  } else if (fn.includes('physics') || fn.includes('unit & measurement')) {
    subject = 'Science';
  } else if (fn.includes('science') || fn.includes('sci ') || fn.includes('sci_') || fn.includes('general science') ||
             fn.includes('sk jha')) {
    subject = 'Science';
  } else if (fn.includes('history') || fn.includes('ancient') || fn.includes('medieval') || fn.includes('modern history') || 
             fn.includes('mughal') || fn.includes('vijaynagar')) {
    subject = 'History';
  } else if (fn.includes('geography') || fn.includes('geo') || fn.includes('mountain') || fn.includes('solar system') ||
             fn.includes('indian map') || fn.includes('world map') || fn.includes('map')) {
    subject = 'Geography';
  } else if (fn.includes('polity') || fn.includes('constitution') || fn.includes('amendment') || fn.includes('preamble')) {
    subject = 'Polity';
  } else if (fn.includes('economy') || fn.includes('economics') || fn.includes('economic') || fn.includes('budget')) {
    subject = 'Economics';
  } else if (fn.includes('computer') || fn.includes('500+ computer')) {
    subject = 'Computer';
  } else if (fn.includes('current affairs') || fn.includes('current_affairs') || fn.includes('gk') || fn.includes('g.k') ||
             fn.includes('general knowledge') || fn.includes('static gk') || fn.includes('general awareness') ||
             fn.includes('current affair') || fn.includes('speedy') || fn.includes('g7 summit') ||
             fn.includes('national appointments') || fn.includes('icc t20')) {
    subject = 'General Awareness';
  } else if (fn.includes('hindi') || fn.includes('हिन्दी') || fn.includes('सामान्य हिन्दी') || fn.includes('general hindi')) {
    subject = 'Hindi';
  } else if (fn.includes('dance') || fn.includes('festival') || fn.includes('musical instrument') || 
             fn.includes('art') || fn.includes('culture') || fn.includes('book and author')) {
    subject = 'Art & Culture';
  } else if (fn.includes('evs')) {
    subject = 'Environment';
  }

  // Haryana GK is always General Awareness
  if (fn.includes('haryana gk') || fn.includes('hr gk') || fn.includes('haryana_gk') || fn.includes('haryana_durdarshan')) {
    subject = 'Haryana GK';
  }

  // ─── Pinnacle Railway detection override ───
  if (fn.includes('pinnacle railway') || fn.includes('pinnacle rail') || fn.includes('rwa rail') || fn.includes('rwa ntpc')) {
    categorySlug = 'railway';
    if (!examSlug) examSlug = 'ntpc';
    if (fn.includes('math')) subject = 'Mathematics';
    else if (fn.includes('reasoning')) subject = 'Reasoning';
    else if (fn.includes('science')) subject = 'Science';
    else if (fn.includes('gs') || fn.includes('general study')) subject = 'General Awareness';
    contentType = 'BOOK';
  }

  // ─── Pinnacle SSC override ───
  if ((fn.includes('pinnacle') && !fn.includes('railway')) && (fn.includes('ssc') || fn.includes('english') || fn.includes('math') || fn.includes('reasoning') || fn.includes('gs'))) {
    if (categorySlug === 'other') categorySlug = 'ssc';
    contentType = 'BOOK';
  }

  // ─── Special large books remain as BOOK ───
  if (contentType === 'EXAM_PDF' && (fn.includes('concept king') || fn.includes('practice king'))) {
    contentType = 'BOOK';
  }

  // Clean up title
  title = title.replace(/^\d+\)\s*/, '').replace(/^@\w+\s+/, '').replace(/\s*\([\d]+\)\s*$/, '');
  if (title.length > 150) title = title.substring(0, 147) + '...';

  return { categorySlug, examSlug, subject, contentType, language, title };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// ─── Main Import ───
function importPdfs() {
  console.log('Starting PDF import from:', PDF_SOURCE);
  console.log('Uploads dir:', UPLOADS_DIR);
  console.log('Database:', DB_PATH);
  console.log('');

  if (!fs.existsSync(PDF_SOURCE)) {
    console.error('PDF source directory not found:', PDF_SOURCE);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(PDF_SOURCE).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${pdfFiles.length} PDF files\n`);

  const insertFile = sqlite.prepare(`
    INSERT OR IGNORE INTO files (id, storage_provider, storage_key, original_name, mime_type, size_bytes, checksum, status)
    VALUES (?, 'local', ?, ?, 'application/pdf', ?, ?, 'active')
  `);

  const insertContent = sqlite.prepare(`
    INSERT OR IGNORE INTO contents (id, title, slug, content_type, category_id, exam_id, subject, author, language, description, pdf_file_id, status, file_size_bytes, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, datetime('now'), datetime('now'), datetime('now'))
  `);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const seen = new Set();

  const transaction = sqlite.transaction(() => {
    for (const filename of pdfFiles) {
      try {
        const srcPath = path.join(PDF_SOURCE, filename);
        const stats = fs.statSync(srcPath);
        
        // Skip very large files (>200MB) to save disk space - create reference only
        const sizeBytes = stats.size;
        
        const classification = classifyPdf(filename);
        const { categorySlug, examSlug, subject, contentType, language, title } = classification;

        // Get category ID
        const catId = getCategoryId(categorySlug);
        if (!catId) {
          console.log(`  SKIP (no category for ${categorySlug}): ${filename}`);
          skipped++;
          continue;
        }

        // Get exam ID (optional)
        let examId = null;
        if (examSlug) {
          examId = getExamId(examSlug, categorySlug);
        }

        // Generate unique slug
        let baseSlug = slugify(title);
        if (!baseSlug || baseSlug.length < 3) baseSlug = slugify(filename.replace('.pdf', ''));
        if (!baseSlug || baseSlug.length < 3) baseSlug = 'pdf-' + crypto.randomUUID().substring(0, 8);

        let slug = baseSlug;
        let counter = 1;
        while (seen.has(slug)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        seen.add(slug);

        // Create file entry
        const fileId = crypto.randomUUID();
        const storageKey = `uploads/${filename}`;
        const checksum = crypto.createHash('md5').update(filename + sizeBytes).digest('hex');

        insertFile.run(fileId, storageKey, filename, sizeBytes, checksum);

        // Create content entry
        const contentId = crypto.randomUUID();
        const description = `${title} | ${contentType === 'BOOK' ? 'Book' : contentType === 'ANSWER_KEY' ? 'Answer Key' : contentType === 'PRACTICE_SET' ? 'Practice Set' : 'PDF'} | ${language}`;

        insertContent.run(
          contentId, title, slug, contentType, catId, examId, subject, null, language,
          description, fileId, sizeBytes
        );

        // Copy file to uploads (create symlink for large files)
        const destPath = path.join(UPLOADS_DIR, filename);
        if (!fs.existsSync(destPath)) {
          if (sizeBytes > 200 * 1024 * 1024) {
            // For very large files, create a small placeholder & note (actual file served from source)
            // We'll use a junction/symlink approach
            try {
              fs.symlinkSync(srcPath, destPath);
            } catch (e) {
              // If symlink fails (Windows permissions), copy anyway
              fs.copyFileSync(srcPath, destPath);
            }
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }

        const examLabel = examSlug ? `[${categorySlug}/${examSlug}]` : `[${categorySlug}]`;
        const subjectLabel = subject ? ` (${subject})` : '';
        console.log(`  OK ${examLabel}${subjectLabel} ${title.substring(0, 60)}`);
        imported++;

      } catch (err) {
        console.log(`  ERR: ${filename} - ${err.message}`);
        errors++;
      }
    }
  });

  transaction();

  console.log(`\n=== Import Complete ===`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Errors:   ${errors}`);
  console.log(`  Total:    ${pdfFiles.length}`);

  sqlite.close();
}

importPdfs();
