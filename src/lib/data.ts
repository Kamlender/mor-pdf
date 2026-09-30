/**
 * PdfXpress | Static Data Access Layer
 * 
 * Reads pre-generated JSON data for static export (GitHub Pages).
 * Run `node generate-static-data.js` to regenerate the JSON from SQLite.
 */

import staticData from './static-data.json';

const allContents: any[] = staticData.contents;

// ─── SUBJECTS ──────────────────────────────────────────────────────

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

// ─── CONTENTS ──────────────────────────────────────────────────────

interface ContentFilters {
  categoryId?: string;
  categorySlug?: string;
  examId?: string;
  contentType?: string;
  status?: string;
  year?: number;
  subject?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export async function getPublishedContents(filters: ContentFilters = {}) {
  let results = [...allContents];

  if (filters.categorySlug) {
    const cat = staticData.categories.find((c: any) => c.slug === filters.categorySlug);
    if (cat) results = results.filter(c => c.categoryId === cat.id);
    else return [];
  }

  if (filters.categoryId) {
    results = results.filter(c => c.categoryId === filters.categoryId);
  }

  if (filters.examId) {
    results = results.filter(c => c.examId === filters.examId);
  }

  if (filters.contentType) {
    results = results.filter(c => c.contentType === filters.contentType);
  }

  if (filters.year) {
    results = results.filter(c => c.year === filters.year);
  }

  if (filters.subject) {
    results = results.filter(c => c.subject === filters.subject);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(c =>
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.author?.toLowerCase().includes(q)
    );
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;
  return results.slice(offset, offset + limit);
}

export async function getContentBySlug(slug: string) {
  return allContents.find(c => c.slug === slug) || null;
}

export async function getContentById(id: string) {
  return allContents.find(c => c.id === id) || null;
}

// ─── SUBJECT QUERIES ───────────────────────────────────────────────

export async function getContentsBySubject(subjectName: string, limit = 50, offset = 0) {
  return allContents
    .filter(c => c.subject === subjectName)
    .slice(offset, offset + limit);
}

export async function getContentsWithNoSubject(limit = 50, offset = 0) {
  return allContents
    .filter(c => !c.subject)
    .slice(offset, offset + limit);
}

export async function getSubjectCounts() {
  const counts: Record<string, number> = {};
  allContents.forEach(c => {
    const key = c.subject || 'Others';
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// ─── ANSWER KEYS ───────────────────────────────────────────────────

export async function getAnswerKeys() {
  return allContents.filter(c => c.contentType === 'ANSWER_KEY');
}

// ─── CATEGORIES ────────────────────────────────────────────────────

export async function getCategories() {
  return staticData.categories;
}

export async function getCategoriesWithCounts() {
  return staticData.categories.map((cat: any) => ({
    ...cat,
    contentCount: allContents.filter(c => c.categoryId === cat.id).length,
  }));
}

// ─── CONTENT COUNT ─────────────────────────────────────────────────

export async function getContentCount(filters: ContentFilters = {}) {
  const results = await getPublishedContents({ ...filters, limit: 99999 });
  return results.length;
}
