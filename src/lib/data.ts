/**
 * PdfXpress | Data Access Layer
 * 
 * Centralized data fetching functions for contents, categories, exams.
 * Used by both server components and API routes.
 */

import db from '@/lib/db';
import { contents, categories, exams, files, seoMetadata } from '@/lib/db/schema';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';

// ─── CATEGORIES ────────────────────────────────────────────────────

export async function getCategories() {
  return db.select().from(categories).where(eq(categories.isActive, true)).all();
}

export async function getCategoryBySlug(slug: string) {
  const results = db.select().from(categories).where(
    and(eq(categories.slug, slug), eq(categories.isActive, true))
  ).all();
  return results[0] || null;
}

export async function getCategoriesWithCounts() {
  const cats = await getCategories();
  return cats.map(cat => ({
    ...cat,
    contentCount: db.select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(and(eq(contents.categoryId, cat.id), eq(contents.status, 'PUBLISHED')))
      .all()[0]?.count || 0,
  }));
}

// ─── EXAMS ─────────────────────────────────────────────────────────

export async function getExamsByCategory(categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];
  
  return db.select().from(exams)
    .where(and(eq(exams.categoryId, category.id), eq(exams.isActive, true)))
    .all();
}

export async function getExamBySlug(examSlug: string, categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;
  
  const results = db.select().from(exams).where(
    and(
      eq(exams.slug, examSlug),
      eq(exams.categoryId, category.id),
      eq(exams.isActive, true)
    )
  ).all();
  return results[0] || null;
}

export async function getAllExams() {
  return db.select().from(exams).where(eq(exams.isActive, true)).all();
}

// ─── CONTENTS ──────────────────────────────────────────────────────

interface ContentFilters {
  categoryId?: string;
  categorySlug?: string;
  examId?: string;
  examSlug?: string;
  contentType?: string;
  status?: string;
  year?: number;
  subject?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function getPublishedContents(filters: ContentFilters = {}) {
  let conditions: any[] = [eq(contents.status, 'PUBLISHED')];

  if (filters.categoryId) {
    conditions.push(eq(contents.categoryId, filters.categoryId));
  }
  
  if (filters.categorySlug) {
    const cat = await getCategoryBySlug(filters.categorySlug);
    if (cat) conditions.push(eq(contents.categoryId, cat.id));
    else return [];
  }

  if (filters.examId) {
    conditions.push(eq(contents.examId, filters.examId));
  }

  if (filters.contentType) {
    conditions.push(eq(contents.contentType, filters.contentType));
  }

  if (filters.year) {
    conditions.push(eq(contents.year, filters.year));
  }

  if (filters.subject) {
    conditions.push(eq(contents.subject, filters.subject));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(contents.title, searchTerm),
        like(contents.description, searchTerm),
        like(contents.subject, searchTerm),
        like(contents.author, searchTerm)
      )
    );
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const query = db.select().from(contents)
    .where(and(...conditions))
    .orderBy(desc(contents.publishedAt))
    .limit(limit)
    .offset(offset);

  const results = query.all();

  // Enrich with category and exam names
  return results.map(content => {
    const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
    const exam = content.examId 
      ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
      : null;
    
    return {
      ...content,
      categoryName: cat?.name || 'Unknown',
      categorySlug: cat?.slug || '',
      examName: exam?.name || null,
      examSlug: exam?.slug || null,
    };
  });
}

export async function getContentBySlug(slug: string) {
  const results = db.select().from(contents)
    .where(eq(contents.slug, slug))
    .all();
  
  if (results.length === 0) return null;
  
  const content = results[0];
  const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
  const exam = content.examId
    ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
    : null;
  const seo = db.select().from(seoMetadata).where(eq(seoMetadata.contentId, content.id)).all()[0];
  const pdfFile = db.select().from(files).where(eq(files.id, content.pdfFileId)).all()[0];

  return {
    ...content,
    categoryName: cat?.name || 'Unknown',
    categorySlug: cat?.slug || '',
    examName: exam?.name || null,
    examSlug: exam?.slug || null,
    seo: seo || null,
    pdfFile: pdfFile || null,
  };
}

export async function getContentById(id: string) {
  const results = db.select().from(contents).where(eq(contents.id, id)).all();
  if (results.length === 0) return null;

  const content = results[0];
  const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
  const exam = content.examId
    ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
    : null;

  return {
    ...content,
    categoryName: cat?.name || 'Unknown',
    categorySlug: cat?.slug || '',
    examName: exam?.name || null,
    examSlug: exam?.slug || null,
  };
}

// ─── ALL CONTENTS (Admin) ──────────────────────────────────────────

export async function getAllContents(filters: ContentFilters = {}) {
  let conditions: any[] = [];

  if (filters.status) {
    conditions.push(eq(contents.status, filters.status));
  }

  if (filters.categoryId) {
    conditions.push(eq(contents.categoryId, filters.categoryId));
  }

  if (filters.contentType) {
    conditions.push(eq(contents.contentType, filters.contentType));
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        like(contents.title, searchTerm),
        like(contents.description, searchTerm)
      )
    );
  }

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const query = conditions.length > 0
    ? db.select().from(contents).where(and(...conditions))
    : db.select().from(contents);

  return query.orderBy(desc(contents.createdAt)).limit(limit).offset(offset).all().map(content => {
    const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
    const exam = content.examId
      ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
      : null;

    return {
      ...content,
      categoryName: cat?.name || 'Unknown',
      categorySlug: cat?.slug || '',
      examName: exam?.name || null,
      examSlug: exam?.slug || null,
    };
  });
}

// ─── CONTENT COUNTS ────────────────────────────────────────────────

export async function getContentCount(filters: ContentFilters = {}) {
  let conditions: any[] = [eq(contents.status, 'PUBLISHED')];

  if (filters.categorySlug) {
    const cat = await getCategoryBySlug(filters.categorySlug);
    if (cat) conditions.push(eq(contents.categoryId, cat.id));
  }

  if (filters.contentType) {
    conditions.push(eq(contents.contentType, filters.contentType));
  }

  const result = db.select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(and(...conditions))
    .all();

  return result[0]?.count || 0;
}

// ─── SUBJECT-BASED QUERIES ────────────────────────────────────────

export const SUBJECTS = [
  { name: 'GK/GS', slug: 'gk-gs', description: 'General Knowledge / General Studies', icon: '🌍' },
  { name: 'Mathematics', slug: 'mathematics', description: 'Maths, Algebra, Geometry, Arithmetic', icon: '📐' },
  { name: 'Reasoning', slug: 'reasoning', description: 'Logical & Analytical Reasoning', icon: '🧠' },
  { name: 'English', slug: 'english', description: 'English Language & Grammar', icon: '📝' },
  { name: 'Hindi', slug: 'hindi', description: 'हिन्दी भाषा एवं व्याकरण', icon: '📖' },
  { name: 'Computer', slug: 'computer', description: 'Computer Knowledge & Awareness', icon: '💻' },
  { name: 'Science', slug: 'science', description: 'Physics, Chemistry, Biology & General Science', icon: '🔬' },
] as const;

export function getSubjectBySlug(slug: string) {
  return SUBJECTS.find(s => s.slug === slug) || null;
}

export function subjectSlugToName(slug: string): string | null {
  const sub = SUBJECTS.find(s => s.slug === slug);
  return sub ? sub.name : null;
}

export async function getContentsBySubject(subjectName: string, limit = 50, offset = 0) {
  const results = db.select().from(contents)
    .where(and(eq(contents.status, 'PUBLISHED'), eq(contents.subject, subjectName)))
    .orderBy(desc(contents.publishedAt))
    .limit(limit)
    .offset(offset)
    .all();

  return results.map(content => {
    const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
    const exam = content.examId
      ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
      : null;
    return {
      ...content,
      categoryName: cat?.name || 'Unknown',
      categorySlug: cat?.slug || '',
      examName: exam?.name || null,
      examSlug: exam?.slug || null,
    };
  });
}

export async function getContentsWithNoSubject(limit = 50, offset = 0) {
  const results = db.select().from(contents)
    .where(and(
      eq(contents.status, 'PUBLISHED'),
      sql`${contents.subject} IS NULL`
    ))
    .orderBy(desc(contents.publishedAt))
    .limit(limit)
    .offset(offset)
    .all();

  return results.map(content => {
    const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
    const exam = content.examId
      ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
      : null;
    return {
      ...content,
      categoryName: cat?.name || 'Unknown',
      categorySlug: cat?.slug || '',
      examName: exam?.name || null,
      examSlug: exam?.slug || null,
    };
  });
}

export async function getSubjectCounts() {
  const results = db.select({
    subject: contents.subject,
    count: sql<number>`count(*)`,
  })
    .from(contents)
    .where(eq(contents.status, 'PUBLISHED'))
    .groupBy(contents.subject)
    .all();

  return results.reduce((acc, row) => {
    acc[row.subject || 'Others'] = row.count;
    return acc;
  }, {} as Record<string, number>);
}

// ─── ANSWER KEYS ───────────────────────────────────────────────────

export async function getAnswerKeys() {
  const results = db.select().from(contents)
    .where(and(eq(contents.status, 'PUBLISHED'), eq(contents.contentType, 'ANSWER_KEY')))
    .orderBy(desc(contents.publishedAt))
    .all();

  return results.map(content => {
    const cat = db.select().from(categories).where(eq(categories.id, content.categoryId)).all()[0];
    const exam = content.examId
      ? db.select().from(exams).where(eq(exams.id, content.examId)).all()[0]
      : null;
    return {
      ...content,
      categoryName: cat?.name || 'Unknown',
      categorySlug: cat?.slug || '',
      examName: exam?.name || null,
      examSlug: exam?.slug || null,
    };
  });
}

// ─── STATS (Admin) ─────────────────────────────────────────────────

export async function getContentStats() {
  const total = db.select({ count: sql<number>`count(*)` }).from(contents).all()[0]?.count || 0;
  const published = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.status, 'PUBLISHED')).all()[0]?.count || 0;
  const draft = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.status, 'DRAFT')).all()[0]?.count || 0;
  const books = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.contentType, 'BOOK')).all()[0]?.count || 0;
  const examPdfs = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.contentType, 'EXAM_PDF')).all()[0]?.count || 0;
  const practiceSets = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.contentType, 'PRACTICE_SET')).all()[0]?.count || 0;
  const answerKeys = db.select({ count: sql<number>`count(*)` }).from(contents).where(eq(contents.contentType, 'ANSWER_KEY')).all()[0]?.count || 0;

  return { total, published, draft, books, examPdfs, practiceSets, answerKeys };
}
