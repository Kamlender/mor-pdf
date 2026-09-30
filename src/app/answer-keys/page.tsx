import Link from 'next/link';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';
import { getAnswerKeys } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Answer Keys | PdfXpress',
  description:
    'SSC, Railway, Haryana Police और अन्य exams की Answer Keys। सभी Answer Key PDFs एक जगह organized।',
};

export default async function AnswerKeysPage() {
  let answerKeys: any[] = [];
  try {
    answerKeys = await getAnswerKeys();
  } catch (e) {
    /* DB might not be ready */
  }

  // Group answer keys by exam name
  const grouped: Record<string, any[]> = {};
  answerKeys.forEach((ak) => {
    const examLabel = ak.examName || 'Other Exams';
    if (!grouped[examLabel]) grouped[examLabel] = [];
    grouped[examLabel].push(ak);
  });

  // Sort groups: named exams first (alphabetical), "Other Exams" last
  const sortedGroups = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other Exams') return 1;
    if (b === 'Other Exams') return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <Header />
      <main className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Answer Keys</span>
        </nav>

        <div className="section-sm">
          <h1
            style={{
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>🔑</span>
            <span className="gradient-text">Answer Keys</span>
          </h1>
          <p>
            सभी exams की Answer Keys एक जगह। Exam-wise organized PDFs for
            quick reference।
          </p>
          <p style={{ marginTop: '0.25rem', opacity: 0.7, fontSize: '0.9rem' }}>
            Total {answerKeys.length} Answer Key PDFs available
          </p>
        </div>

        {sortedGroups.length > 0 ? (
          sortedGroups.map((examName) => (
            <section
              className="section-sm"
              key={examName}
              id={`ak-${examName.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="section-header">
                <h2 className="section-title">
                  {examName} ({grouped[examName].length})
                </h2>
              </div>
              <div className="grid-cards">
                {grouped[examName].map((content: any) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="empty-state">
            <div
              className="empty-state-icon"
              style={{ fontSize: '3rem' }}
            >
              🔑
            </div>
            <h3 className="empty-state-title">No answer keys yet</h3>
            <p className="empty-state-desc">
              Answer keys will appear here once published via the admin
              panel.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
