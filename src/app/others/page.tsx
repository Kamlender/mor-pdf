import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';
import { getContentsWithNoSubject } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Others | Study Material & PDFs | PdfXpress',
  description: 'अन्य study material और PDFs जो किसी specific subject में categorize नहीं हैं। PdfXpress पर organized educational content।',
};

export default async function OthersPage() {
  let contentList: any[] = [];
  try {
    contentList = await getContentsWithNoSubject(500);
  } catch (e) { /* DB might not be ready */ }

  return (
    <>
      <Header />
      <main className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Others</span>
        </nav>

        <div className="section-sm">
          <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📚</span>
            <span className="gradient-text">Others</span>
          </h1>
          <p>अन्य study material और PDFs जो किसी specific subject में categorize नहीं हैं।</p>
        </div>

        <section className="section-sm" id="others-content">
          <div className="section-header">
            <h2 className="section-title">
              Other Material ({contentList.length} PDFs)
            </h2>
          </div>
          {contentList.length > 0 ? (
            <div className="grid-cards">
              {contentList.map((content: any) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>📚</div>
              <h3 className="empty-state-title">No content yet</h3>
              <p className="empty-state-desc">Content will appear here once published via the admin panel.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
