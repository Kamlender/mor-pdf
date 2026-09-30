/**
 * PdfXpress | Database Schema (Drizzle ORM)
 * 
 * Follows TRD's PostgreSQL schema design exactly.
 * Uses SQLite for V1 development (swappable to PostgreSQL via Drizzle).
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── CATEGORIES ────────────────────────────────────────────────────
// SSC, Railway, Other
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── EXAMS ─────────────────────────────────────────────────────────
// CGL, CHSL, MTS, NTPC, Group D, etc.
export const exams = sqliteTable('exams', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── FILES ─────────────────────────────────────────────────────────
// References to actual files in object storage / local filesystem
export const files = sqliteTable('files', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  storageProvider: text('storage_provider').notNull().default('local'),
  storageKey: text('storage_key').notNull().unique(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  checksum: text('checksum'),
  status: text('status').notNull().default('active'), // active, deleted
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── CONTENTS ──────────────────────────────────────────────────────
// Primary content table - PDFs, books, practice sets, answer keys
export const contents = sqliteTable('contents', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentType: text('content_type').notNull(), // BOOK, EXAM_PDF, PRACTICE_SET, ANSWER_KEY
  categoryId: text('category_id').notNull().references(() => categories.id),
  examId: text('exam_id').references(() => exams.id),
  subject: text('subject'),
  author: text('author'),
  sourceName: text('source_name'),
  year: integer('year'),
  language: text('language').default('Hindi'),
  description: text('description'),
  coverFileId: text('cover_file_id').references(() => files.id),
  thumbnailFileId: text('thumbnail_file_id').references(() => files.id),
  pdfFileId: text('pdf_file_id').notNull().references(() => files.id),
  status: text('status').notNull().default('DRAFT'), // DRAFT, PUBLISHED, UNPUBLISHED, PROCESSING, FAILED
  pageCount: integer('page_count'),
  fileSizeBytes: integer('file_size_bytes'),
  contentHash: text('content_hash').unique(),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── TAGS ──────────────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

// ─── CONTENT TAGS ──────────────────────────────────────────────────
export const contentTags = sqliteTable('content_tags', {
  contentId: text('content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

// ─── CONTENT RELATIONS ─────────────────────────────────────────────
// Paper ↔ Answer Key, related content links
export const contentRelations = sqliteTable('content_relations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceContentId: text('source_content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  targetContentId: text('target_content_id').notNull().references(() => contents.id, { onDelete: 'cascade' }),
  relationType: text('relation_type').notNull(), // HAS_ANSWER_KEY, RELATED_CONTENT
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});

// ─── SEO METADATA ──────────────────────────────────────────────────
export const seoMetadata = sqliteTable('seo_metadata', {
  contentId: text('content_id').primaryKey().references(() => contents.id, { onDelete: 'cascade' }),
  seoTitle: text('seo_title').notNull(),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImageFileId: text('og_image_file_id').references(() => files.id),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

// ─── ADMINS ────────────────────────────────────────────────────────
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('ADMIN'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  lastLoginAt: text('last_login_at'),
});

// ─── ADMIN SESSIONS ────────────────────────────────────────────────
export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  adminId: text('admin_id').notNull().references(() => admins.id, { onDelete: 'cascade' }),
  sessionHash: text('session_hash').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  lastUsedAt: text('last_used_at'),
});

// ─── TYPE EXPORTS ──────────────────────────────────────────────────
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
export type FileRecord = typeof files.$inferSelect;
export type NewFileRecord = typeof files.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type SeoMeta = typeof seoMetadata.$inferSelect;

// ─── CONTENT TYPE & STATUS ENUMS ───────────────────────────────────
export const CONTENT_TYPES = ['BOOK', 'EXAM_PDF', 'PRACTICE_SET', 'ANSWER_KEY'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'PROCESSING', 'FAILED'] as const;
export type ContentStatus = typeof CONTENT_STATUSES[number];

export const RELATION_TYPES = ['HAS_ANSWER_KEY', 'RELATED_CONTENT'] as const;
export type RelationType = typeof RELATION_TYPES[number];
