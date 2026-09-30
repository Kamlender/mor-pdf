/**
 * Pre-build script: Extracts all data from SQLite DB into a JSON file
 * so the Next.js static export can use it without needing better-sqlite3 at build time.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'pdfxpress.db');

if (!fs.existsSync(DB_PATH)) {
  console.log('No database found, creating empty data file');
  fs.writeFileSync(path.join(__dirname, 'src', 'lib', 'static-data.json'), JSON.stringify({
    categories: [],
    exams: [],
    contents: [],
  }, null, 2));
  process.exit(0);
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Fetch all data
const categories = db.prepare(`SELECT * FROM categories WHERE is_active = 1`).all();
const exams = db.prepare(`SELECT * FROM exams WHERE is_active = 1`).all();
const allContents = db.prepare(`SELECT * FROM contents WHERE status = 'PUBLISHED' ORDER BY published_at DESC`).all();
const seoData = db.prepare(`SELECT * FROM seo_metadata`).all();

// Enrich contents with category/exam names
const catMap = {};
categories.forEach(c => { catMap[c.id] = c; });
const examMap = {};
exams.forEach(e => { examMap[e.id] = e; });
const seoMap = {};
seoData.forEach(s => { seoMap[s.content_id] = s; });

const enrichedContents = allContents.map(c => ({
  id: c.id,
  title: c.title,
  slug: c.slug,
  contentType: c.content_type,
  categoryId: c.category_id,
  examId: c.exam_id,
  subject: c.subject,
  author: c.author,
  sourceName: c.source_name,
  year: c.year,
  language: c.language,
  description: c.description,
  coverFileId: c.cover_file_id,
  thumbnailFileId: c.thumbnail_file_id,
  pdfFileId: c.pdf_file_id,
  status: c.status,
  pageCount: c.page_count,
  fileSizeBytes: c.file_size_bytes,
  publishedAt: c.published_at,
  createdAt: c.created_at,
  categoryName: catMap[c.category_id]?.name || 'Unknown',
  categorySlug: catMap[c.category_id]?.slug || '',
  examName: examMap[c.exam_id]?.name || null,
  examSlug: examMap[c.exam_id]?.slug || null,
  seo: seoMap[c.id] || null,
}));

const data = {
  categories: categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
  })),
  exams: exams.map(e => ({
    id: e.id,
    categoryId: e.category_id,
    name: e.name,
    slug: e.slug,
  })),
  contents: enrichedContents,
};

const outPath = path.join(__dirname, 'src', 'lib', 'static-data.json');
fs.writeFileSync(outPath, JSON.stringify(data));

console.log(`✅ Generated static-data.json:`);
console.log(`   Categories: ${data.categories.length}`);
console.log(`   Exams: ${data.exams.length}`);
console.log(`   Contents: ${data.contents.length}`);
console.log(`   File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
