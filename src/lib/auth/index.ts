/**
 * PdfXpress | Admin Authentication Module
 * 
 * Handles password hashing, session management, and auth middleware.
 * Uses SHA-256 for V1 (upgrade to Argon2id for production).
 */

import crypto from 'crypto';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { admins, adminSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'mor_pdf_session';
const SESSION_DURATION_HOURS = 24;

/**
 * Hash a password using SHA-256 (V1 development; use Argon2id in production).
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password against stored hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Create a new session for an admin user.
 */
export async function createSession(adminId: string): Promise<string> {
  const sessionToken = crypto.randomUUID();
  const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  db.insert(adminSessions).values({
    id: crypto.randomUUID(),
    adminId,
    sessionHash,
    expiresAt,
  }).run();

  return sessionToken;
}

/**
 * Validate a session token and return the admin user if valid.
 */
export async function validateSession(sessionToken: string) {
  const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
  
  const sessions = db.select().from(adminSessions)
    .where(eq(adminSessions.sessionHash, sessionHash))
    .all();

  if (sessions.length === 0) return null;

  const session = sessions[0];
  
  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    // Delete expired session
    db.delete(adminSessions).where(eq(adminSessions.id, session.id)).run();
    return null;
  }

  // Update last used
  db.update(adminSessions)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(adminSessions.id, session.id))
    .run();

  // Get admin
  const admin = db.select().from(admins)
    .where(eq(admins.id, session.adminId))
    .all();

  if (admin.length === 0 || !admin[0].isActive) return null;

  return {
    admin: admin[0],
    session,
  };
}

/**
 * Delete a session (logout).
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');
  db.delete(adminSessions).where(eq(adminSessions.sessionHash, sessionHash)).run();
}

/**
 * Get the current admin from the request cookies.
 */
export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionToken) return null;
  
  return validateSession(sessionToken);
}

/**
 * Admin login - validates credentials and creates session.
 */
export async function adminLogin(email: string, password: string) {
  const admin = db.select().from(admins)
    .where(eq(admins.email, email))
    .all();

  if (admin.length === 0) return null;
  if (!admin[0].isActive) return null;
  if (!verifyPassword(password, admin[0].passwordHash)) return null;

  // Update last login
  db.update(admins)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(admins.id, admin[0].id))
    .run();

  const sessionToken = await createSession(admin[0].id);

  return {
    admin: admin[0],
    sessionToken,
  };
}

export { SESSION_COOKIE_NAME };
