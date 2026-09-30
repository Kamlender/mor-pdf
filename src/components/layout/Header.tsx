'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/gk-gs', label: 'GK/GS' },
  { href: '/mathematics', label: 'Mathematics' },
  { href: '/reasoning', label: 'Reasoning' },
  { href: '/english', label: 'English' },
  { href: '/hindi', label: 'Hindi' },
  { href: '/computer', label: 'Computer' },
  { href: '/science', label: 'Science' },
  { href: '/others', label: 'Others' },
  { href: '/answer-keys', label: 'Answer Keys' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="header" id="main-header">
        <div className="header-inner">
          <Link href="/" className="header-logo">
            <img
              src="/images/feather.jpg"
              alt="PdfXpress"
              className="header-logo-icon"
              style={{ mixBlendMode: 'screen', borderRadius: '4px' }}
            />
            <span>
              <span className="gradient-text">Pdf</span>Xpress
            </span>
          </Link>

          <nav className="header-nav" id="desktop-nav">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`header-nav-link${
                  pathname === link.href || 
                  (link.href !== '/' && pathname.startsWith(link.href))
                    ? ' active'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/search" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="hide-mobile">Search</span>
            </Link>

            <button
              className="header-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} id="mobile-nav">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-nav-link${
              pathname === link.href || 
              (link.href !== '/' && pathname.startsWith(link.href))
                ? ' active'
                : ''
            }`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/search"
          className="mobile-nav-link"
          onClick={() => setMobileOpen(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Search
        </Link>
      </nav>
    </>
  );
}
