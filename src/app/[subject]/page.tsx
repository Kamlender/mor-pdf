import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';
import { getContentsBySubject, getSubjectBySlug, SUBJECTS } from '@/lib/data';

type Props = {
  params: Promise<{ subject: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = getSubjectBySlug(slug);
  if (!subject) return { title: 'Subject Not Found | PdfXpress' };

  return {
    title: `${subject.name} | PDFs & Study Material | PdfXpress`,
    description: `${subject.name} के लिए PDFs, books और study material। ${subject.description}। PdfXpress पर organized study material।`,
  };
}

export function generateStaticParams() {
  return SUBJECTS.map(s => ({ subject: s.slug }));
}

export default async function SubjectPage({ params }: Props) {
  const { subject: slug } = await params;
  const subject = getSubjectBySlug(slug);

  if (!subject) return notFound();

  let contentList: any[] = [];
  try {
    contentList = await getContentsBySubject(subject.name, 500);
  } catch (e) { /* DB might not be ready */ }

  return (
    <>
      <Header />
      <main className="container">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{subject.name}</span>
        </nav>

        <div className="section-sm">
          <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{subject.icon}</span>
            <span className="gradient-text">{subject.name}</span>
          </h1>
          <p>{subject.description} | PDFs, books और study material।</p>
        </div>

        <section className="section-sm" id={`${slug}-content`}>
          <div className="section-header">
            <h2 className="section-title">
              {subject.name} Material ({contentList.length} PDFs)
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
              <div className="empty-state-icon" style={{ fontSize: '3rem' }}>{subject.icon}</div>
              <h3 className="empty-state-title">No {subject.name} content yet</h3>
              <p className="empty-state-desc">Content will appear here once published via the admin panel.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
