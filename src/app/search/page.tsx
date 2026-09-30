'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    contentType: '',
    year: '',
  });
  const [hasSearched, setHasSearched] = useState(false);

  async function performSearch() {
    if (!query.trim() && !filters.category && !filters.contentType) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (filters.category) params.set('category', filters.category);
      if (filters.contentType) params.set('contentType', filters.contentType);
      if (filters.year) params.set('year', filters.year);

      const res = await fetch(`/api/v1/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.items || []);
    } catch (e) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      performSearch();
    }
  }

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '70vh' }}>
        <div className="section-sm">
          <h1 style={{ marginBottom: '1rem' }}>
            <span className="gradient-text">Search</span>
          </h1>

          {/* Search Input */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input input-lg"
              placeholder="Search books, exams, PDFs... (SSC CGL, NTPC Book, etc.)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              id="search-input"
              style={{ flex: 1, minWidth: '250px' }}
            />
            <button
              className="btn btn-primary btn-lg"
              onClick={performSearch}
              id="search-btn"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <select
              className="input select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ width: 'auto', minWidth: '150px' }}
              id="filter-category"
            >
              <option value="">All Categories</option>
              <option value="ssc">SSC</option>
              <option value="railway">Railway</option>
              <option value="banking">Banking</option>
              <option value="state-exams">State Exams</option>
              <option value="other-exams">Other Exams</option>
              <option value="other">Other</option>
            </select>

            <select
              className="input select"
              value={filters.contentType}
              onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
              style={{ width: 'auto', minWidth: '150px' }}
              id="filter-type"
            >
              <option value="">All Types</option>
              <option value="BOOK">Books</option>
              <option value="EXAM_PDF">Exam PDFs</option>
              <option value="PRACTICE_SET">Practice Sets</option>
              <option value="ANSWER_KEY">Answer Keys</option>
            </select>

            <select
              className="input select"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              style={{ width: 'auto', minWidth: '120px' }}
              id="filter-year"
            >
              <option value="">All Years</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <section className="section-sm" id="search-results">
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner spinner-lg"></div>
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <>
                <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
                <div className="grid-cards">
                  {results.map((content: any) => (
                    <ContentCard key={content.id} content={content} />
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ fontSize: '3rem', opacity: 0.5 }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <h3 className="empty-state-title">No results found</h3>
                <p className="empty-state-desc">Try different keywords or adjust your filters.</p>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '3rem', opacity: 0.5 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h3 className="empty-state-title">Search PdfXpress</h3>
              <p className="empty-state-desc">
                Books, PDFs, practice sets और answer keys खोजें।<br />
                Examples: &quot;SSC CGL&quot;, &quot;Railway NTPC&quot;, &quot;English Book&quot;
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
