/**
 * PdfXpress | Database Seed Script
 * Seeds default categories, exams, and admin account
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { categories, exams, admins } from './schema';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'pdfxpress.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

// Simple password hash for seed (in production use argon2)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log(' Seeding PdfXpress database...\n');

  // ─── Create tables ─────────────────────────────────────────────
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_id, slug)
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      storage_provider TEXT NOT NULL DEFAULT 'local',
      storage_key TEXT NOT NULL UNIQUE,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      checksum TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content_type TEXT NOT NULL,
      category_id TEXT NOT NULL REFERENCES categories(id),
      exam_id TEXT REFERENCES exams(id),
      subject TEXT,
      author TEXT,
      source_name TEXT,
      year INTEGER,
      language TEXT DEFAULT 'Hindi',
      description TEXT,
      cover_file_id TEXT REFERENCES files(id),
      thumbnail_file_id TEXT REFERENCES files(id),
      pdf_file_id TEXT NOT NULL REFERENCES files(id),
      status TEXT NOT NULL DEFAULT 'DRAFT',
      page_count INTEGER,
      file_size_bytes INTEGER,
      content_hash TEXT UNIQUE,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS content_tags (
      content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (content_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS content_relations (
      id TEXT PRIMARY KEY,
      source_content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      target_content_id TEXT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
      relation_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS seo_metadata (
      content_id TEXT PRIMARY KEY REFERENCES contents(id) ON DELETE CASCADE,
      seo_title TEXT NOT NULL,
      meta_description TEXT,
      canonical_url TEXT,
      og_title TEXT,
      og_description TEXT,
      og_image_file_id TEXT REFERENCES files(id),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      session_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_used_at TEXT
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);
    CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
    CREATE INDEX IF NOT EXISTS idx_contents_category ON contents(category_id);
    CREATE INDEX IF NOT EXISTS idx_contents_exam ON contents(exam_id);
    CREATE INDEX IF NOT EXISTS idx_contents_type ON contents(content_type);
    CREATE INDEX IF NOT EXISTS idx_contents_year ON contents(year);
    CREATE INDEX IF NOT EXISTS idx_contents_hash ON contents(content_hash);
    CREATE INDEX IF NOT EXISTS idx_contents_cat_status ON contents(category_id, status);
    CREATE INDEX IF NOT EXISTS idx_contents_exam_status ON contents(exam_id, status);
    CREATE INDEX IF NOT EXISTS idx_contents_type_status ON contents(content_type, status);
  `);

  console.log(' Tables created\n');

  // ─── Seed Categories ─────────────────────────────────────────────
  const categoryData = [
    { id: crypto.randomUUID(), name: 'SSC', slug: 'ssc', description: 'Staff Selection Commission exams | CGL, CHSL, MTS, GD and more' },
    { id: crypto.randomUUID(), name: 'Railway', slug: 'railway', description: 'Railway Recruitment Board exams | NTPC, Group D and more' },
    { id: crypto.randomUUID(), name: 'Banking', slug: 'banking', description: 'Banking exams | IBPS PO, IBPS Clerk, SBI PO, SBI Clerk, RBI and more' },
    { id: crypto.randomUUID(), name: 'State Exams', slug: 'state-exams', description: 'State PSC/PCS, Police, Patwari, TET exams | UPPSC, BPSC, MPPSC, RPSC and more' },
    { id: crypto.randomUUID(), name: 'Other Exams', slug: 'other-exams', description: 'UPSC, NDA, CDS, CUET, GATE and other competitive exams' },
    { id: crypto.randomUUID(), name: 'Other', slug: 'other', description: 'Other competitive exams and general study material' },
  ];

  for (const cat of categoryData) {
    try {
      db.insert(categories).values(cat).run();
      console.log(`Category: ${cat.name}`);
    } catch {
      console.log(`⏩ Category already exists: ${cat.name}`);
    }
  }

  // ─── Seed Exams ───────────────────────────────────────────────────
  const sscCategory = db.select().from(categories).all().find(c => c.slug === 'ssc');
  const railwayCategory = db.select().from(categories).all().find(c => c.slug === 'railway');
  const bankingCategory = db.select().from(categories).all().find(c => c.slug === 'banking');
  const stateExamsCategory = db.select().from(categories).all().find(c => c.slug === 'state-exams');
  const otherExamsCategory = db.select().from(categories).all().find(c => c.slug === 'other-exams');
  const otherCategory = db.select().from(categories).all().find(c => c.slug === 'other');

  if (sscCategory) {
    const sscExams = [
      { name: 'CGL', slug: 'cgl', description: 'Combined Graduate Level Examination' },
      { name: 'CHSL', slug: 'chsl', description: 'Combined Higher Secondary Level Examination' },
      { name: 'MTS', slug: 'mts', description: 'Multi Tasking Staff Examination' },
      { name: 'GD', slug: 'gd', description: 'GD Constable Examination' },
      { name: 'Stenographer', slug: 'stenographer', description: 'Stenographer Grade C & D Examination' },
      { name: 'CPO', slug: 'cpo', description: 'Central Police Organisation Examination' },
    ];

    for (const exam of sscExams) {
      try {
        db.insert(exams).values({ id: crypto.randomUUID(), categoryId: sscCategory.id, ...exam }).run();
        console.log(`Exam: SSC ${exam.name}`);
      } catch {
        console.log(`⏩ Exam already exists: SSC ${exam.name}`);
      }
    }
  }

  if (railwayCategory) {
    const railwayExams = [
      { name: 'NTPC', slug: 'ntpc', description: 'Non Technical Popular Categories' },
      { name: 'Group D', slug: 'group-d', description: 'Railway Group D Level 1' },
      { name: 'ALP', slug: 'alp', description: 'Assistant Loco Pilot' },
      { name: 'JE', slug: 'je', description: 'Junior Engineer' },
    ];

    for (const exam of railwayExams) {
      try {
        db.insert(exams).values({ id: crypto.randomUUID(), categoryId: railwayCategory.id, ...exam }).run();
        console.log(`Exam: Railway ${exam.name}`);
      } catch {
        console.log(`⏩ Exam already exists: Railway ${exam.name}`);
      }
    }
  }

  if (bankingCategory) {
    const bankingExams = [
      { name: 'IBPS PO', slug: 'ibps-po', description: 'Institute of Banking Personnel Selection | Probationary Officer' },
      { name: 'IBPS Clerk', slug: 'ibps-clerk', description: 'Institute of Banking Personnel Selection | Clerical Cadre' },
      { name: 'IBPS SO', slug: 'ibps-so', description: 'Institute of Banking Personnel Selection | Specialist Officer' },
      { name: 'IBPS RRB', slug: 'ibps-rrb', description: 'Institute of Banking Personnel Selection | Regional Rural Banks' },
      { name: 'SBI PO', slug: 'sbi-po', description: 'State Bank of India | Probationary Officer' },
      { name: 'SBI Clerk', slug: 'sbi-clerk', description: 'State Bank of India | Clerical Cadre' },
      { name: 'RBI Grade B', slug: 'rbi-grade-b', description: 'Reserve Bank of India | Grade B Officer' },
      { name: 'RBI Assistant', slug: 'rbi-assistant', description: 'Reserve Bank of India | Assistant' },
      { name: 'NABARD', slug: 'nabard', description: 'National Bank for Agriculture and Rural Development' },
      { name: 'LIC AAO', slug: 'lic-aao', description: 'Life Insurance Corporation | Assistant Administrative Officer' },
      { name: 'NIACL', slug: 'niacl', description: 'New India Assurance Company Limited' },
      { name: 'IDBI Bank', slug: 'idbi', description: 'IDBI Bank | Executive & Assistant Manager' },
    ];

    for (const exam of bankingExams) {
      try {
        db.insert(exams).values({ id: crypto.randomUUID(), categoryId: bankingCategory.id, ...exam }).run();
        console.log(`Exam: Banking ${exam.name}`);
      } catch {
        console.log(`⏩ Exam already exists: Banking ${exam.name}`);
      }
    }
  }

  if (stateExamsCategory) {
    const stateExams = [
      { name: 'UPPSC / UP PCS', slug: 'uppsc', description: 'Uttar Pradesh Public Service Commission' },
      { name: 'BPSC', slug: 'bpsc', description: 'Bihar Public Service Commission' },
      { name: 'MPPSC', slug: 'mppsc', description: 'Madhya Pradesh Public Service Commission' },
      { name: 'RPSC / RAS', slug: 'rpsc', description: 'Rajasthan Public Service Commission' },
      { name: 'UKPSC', slug: 'ukpsc', description: 'Uttarakhand Public Service Commission' },
      { name: 'JPSC', slug: 'jpsc', description: 'Jharkhand Public Service Commission' },
      { name: 'CGPSC', slug: 'cgpsc', description: 'Chhattisgarh Public Service Commission' },
      { name: 'HPSC / HCS', slug: 'hpsc', description: 'Haryana Public Service Commission' },
      { name: 'WBPSC', slug: 'wbpsc', description: 'West Bengal Public Service Commission' },
      { name: 'TNPSC', slug: 'tnpsc', description: 'Tamil Nadu Public Service Commission' },
      { name: 'KPSC', slug: 'kpsc', description: 'Karnataka Public Service Commission' },
      { name: 'APPSC', slug: 'appsc', description: 'Andhra Pradesh Public Service Commission' },
      { name: 'TSPSC', slug: 'tspsc', description: 'Telangana State Public Service Commission' },
      { name: 'GPSC', slug: 'gpsc', description: 'Gujarat Public Service Commission' },
      { name: 'OPSC', slug: 'opsc', description: 'Odisha Public Service Commission' },
      { name: 'PPSC', slug: 'ppsc', description: 'Punjab Public Service Commission' },
      { name: 'HPPSC', slug: 'hppsc', description: 'Himachal Pradesh Public Service Commission' },
      { name: 'APSC', slug: 'apsc', description: 'Assam Public Service Commission' },
      { name: 'UP Lekhpal', slug: 'up-lekhpal', description: 'Uttar Pradesh Lekhpal Examination' },
      { name: 'UP SI', slug: 'up-si', description: 'Uttar Pradesh Sub Inspector Examination' },
      { name: 'UP Constable', slug: 'up-constable', description: 'Uttar Pradesh Police Constable Examination' },
      { name: 'Bihar SI', slug: 'bihar-si', description: 'Bihar Sub Inspector Examination' },
      { name: 'Bihar Constable', slug: 'bihar-constable', description: 'Bihar Police Constable Examination' },
      { name: 'MP SI', slug: 'mp-si', description: 'Madhya Pradesh Sub Inspector Examination' },
      { name: 'MP Patwari', slug: 'mp-patwari', description: 'Madhya Pradesh Patwari Examination' },
      { name: 'Rajasthan Patwari', slug: 'rajasthan-patwari', description: 'Rajasthan Patwari Examination' },
      { name: 'Rajasthan Police', slug: 'rajasthan-police', description: 'Rajasthan Police Constable Examination' },
      { name: 'CTET', slug: 'ctet', description: 'Central Teacher Eligibility Test' },
      { name: 'UPTET', slug: 'uptet', description: 'Uttar Pradesh Teacher Eligibility Test' },
      { name: 'Super TET', slug: 'super-tet', description: 'Super TET Examination' },
    ];

    for (const exam of stateExams) {
      try {
        db.insert(exams).values({ id: crypto.randomUUID(), categoryId: stateExamsCategory.id, ...exam }).run();
        console.log(`Exam: State ${exam.name}`);
      } catch {
        console.log(`⏩ Exam already exists: State ${exam.name}`);
      }
    }
  }

  if (otherExamsCategory) {
    const otherExams = [
      { name: 'UPSC CSE', slug: 'upsc-cse', description: 'Union Public Service Commission | Civil Services Examination' },
      { name: 'NDA', slug: 'nda', description: 'National Defence Academy Examination' },
      { name: 'CDS', slug: 'cds', description: 'Combined Defence Services Examination' },
      { name: 'AFCAT', slug: 'afcat', description: 'Air Force Common Admission Test' },
      { name: 'CUET', slug: 'cuet', description: 'Common University Entrance Test' },
      { name: 'GATE', slug: 'gate', description: 'Graduate Aptitude Test in Engineering' },
      { name: 'UGC NET/JRF', slug: 'net-jrf', description: 'National Eligibility Test / Junior Research Fellowship' },
      { name: 'CLAT', slug: 'clat', description: 'Common Law Admission Test' },
      { name: 'CAT', slug: 'cat', description: 'Common Admission Test (MBA)' },
      { name: 'RRB PO', slug: 'rrb-po', description: 'Regional Rural Bank Probationary Officer' },
      { name: 'EPFO', slug: 'epfo', description: 'Employees Provident Fund Organisation' },
      { name: 'ESIC', slug: 'esic', description: 'Employees State Insurance Corporation | UDC/Steno' },
    ];

    for (const exam of otherExams) {
      try {
        db.insert(exams).values({ id: crypto.randomUUID(), categoryId: otherExamsCategory.id, ...exam }).run();
        console.log(`Exam: Other ${exam.name}`);
      } catch {
        console.log(`⏩ Exam already exists: Other ${exam.name}`);
      }
    }
  }

  // ─── Seed Admin ───────────────────────────────────────────────────
  try {
    db.insert(admins).values({
      id: crypto.randomUUID(),
      email: 'admin@morpdf.com',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
    }).run();
    console.log('\n   Admin created: admin@morpdf.com / admin123');
  } catch {
    console.log('\n  ⏩ Admin already exists');
  }

  console.log('\n Seed complete!\n');
  sqlite.close();
}

seed().catch(console.error);
