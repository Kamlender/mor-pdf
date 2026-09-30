import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PDFReaderLauncher from '@/components/reader/PDFReaderLauncher';
import ExamLogo from '@/components/ui/ExamLogo';
import { getContentBySlug, getPublishedContents, SUBJECTS } from '@/lib/data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const allContents = await getPublishedContents({ limit: 9999 });
    return allContents.map((c: any) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let content: any = null;
  try {
    content = await getContentBySlug(slug);
  } catch (e) { /* */ }

  if (!content) {
    return { title: 'Content Not Found | PdfXpress' };
  }

  const seoTitle = content.seo?.seoTitle || `${content.title} | PdfXpress`;
  const seoDesc = content.seo?.metaDescription || `${content.title} | ${content.subject || ''} PDF on PdfXpress`;

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      type: 'article',
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  BOOK: 'Book',
  EXAM_PDF: 'Exam PDF',
  PRACTICE_SET: 'Practice Set',
  ANSWER_KEY: 'Answer Key',
};

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  let content: any = null;

  try {
    content = await getContentBySlug(slug);
  } catch (e) { /* DB might not be ready */ }

  if (!content || content.status !== 'PUBLISHED') {
    return notFound();
  }

  // Build breadcrumb path - subject-based
  const breadcrumbs = [
    { href: '/', label: 'Home' },
  ];

  if (content.subject) {
    const subjectInfo = SUBJECTS.find(s => s.name === content.subject);
    if (subjectInfo) {
      breadcrumbs.push({ href: `/${subjectInfo.slug}`, label: subjectInfo.name });
    }
  } else {
    breadcrumbs.push({ href: '/others', label: 'Others' });
  }

  // JSON-LD structured data
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': content.contentType === 'BOOK' ? 'Book' : 'CreativeWork',
    name: content.title,
    description: content.description || '',
    author: content.author ? { '@type': 'Person', name: content.author } : undefined,
    datePublished: content.publishedAt,
    inLanguage: content.language || 'hi',
    publisher: { '@type': 'Organization', name: 'PdfXpress' },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((bc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: bc.label,
      item: `https://morpdf.com${bc.href}`,
    })),
  };

  return (
    <>
      <Header />
      <main className="container">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="breadcrumb">
          {breadcrumbs.map((bc, i) => (
            <span key={bc.href}>
              {i > 0 && <span className="breadcrumb-separator"> › </span>}
              <Link href={bc.href}>{bc.label}</Link>
            </span>
          ))}
          <span className="breadcrumb-separator"> › </span>
          <span className="breadcrumb-current">{content.title}</span>
        </nav>

        <article className="section-sm" style={{ maxWidth: '900px' }}>
          {/* Content Header */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {/* Cover */}
            <div style={{ width: '250px', flexShrink: 0 }}>
              <div className="cover-placeholder" style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }}>
                <img src="/images/feather.jpg" alt="PdfXpress" style={{ width: '100px', height: '100px', objectFit: 'contain', mixBlendMode: 'screen' }} />
              </div>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-teal">{TYPE_LABELS[content.contentType] || 'PDF'}</span>
                {content.year && <span className="badge badge-amber">{content.year}</span>}
                {content.language && <span className="badge badge-blue">{content.language}</span>}
              </div>

              <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '1rem' }}>{content.title}</h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {content.categoryName && (
                  <div className="card-meta">
                    <span>Category: <strong>{content.categoryName}</strong></span>
                  </div>
                )}
                {content.examName && (
                  <div className="card-meta">
                    <span>Exam: <strong>{content.examName}</strong></span>
                  </div>
                )}
                {content.subject && (
                  <div className="card-meta">
                    <span>Subject: <strong>{content.subject}</strong></span>
                  </div>
                )}
                {content.author && (
                  <div className="card-meta">
                    <span>Author: <strong>{content.author}</strong></span>
                  </div>
                )}
                {content.pageCount && (
                  <div className="card-meta">
                    <span>Pages: <strong>{content.pageCount}</strong></span>
                  </div>
                )}
              </div>

              {content.description && (
                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                  {content.description}
                </p>
              )}

              <PDFReaderLauncher
                contentId={content.id}
                contentType={content.contentType}
                title={content.title}
                pdfFileId={content.pdfFileId}
              />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
