import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';
import { getPublishedContents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'All Content | PdfXpress',
  description: 'सभी PDFs, Books, Practice Sets और Answer Keys एक जगह।',
};

export default async function SearchPage() {
  let allContents: any[] = [];
  try {
    allContents = await getPublishedContents({ limit: 9999 });
  } catch (e) { /* */ }

  return (
    <>
      <Header />
      <main className="container" style={{ minHeight: '70vh' }}>
        <div className="section-sm">
          <h1 style={{ marginBottom: '0.5rem' }}>
            <span className="gradient-text">All Content</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Total {allContents.length} PDFs available
          </p>
        </div>

        <section className="section-sm" id="all-content">
          {allContents.length > 0 ? (
            <div className="grid-cards">
              {allContents.map((content: any) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '3rem', opacity: 0.5 }}>📚</div>
              <h3 className="empty-state-title">No content yet</h3>
              <p className="empty-state-desc">Content will appear here once published.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
