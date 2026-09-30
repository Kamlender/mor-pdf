import Link from 'next/link';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    slug: string;
    contentType: string;
    categoryName: string;
    categorySlug: string;
    examName?: string | null;
    examSlug?: string | null;
    subject?: string | null;
    author?: string | null;
    year?: number | null;
    language?: string | null;
    description?: string | null;
    coverFileId?: string | null;
    pageCount?: number | null;
  };
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  BOOK: { label: 'Book', className: 'badge-gold' },
  EXAM_PDF: { label: 'Exam PDF', className: 'badge-teal' },
  PRACTICE_SET: { label: 'Practice Set', className: 'badge-blue' },
  ANSWER_KEY: { label: 'Answer Key', className: 'badge-green' },
};

export default function ContentCard({ content }: ContentCardProps) {
  const badge = TYPE_BADGES[content.contentType] || { label: 'PDF', className: 'badge-teal' };

  return (
    <Link
      href={`/content/${content.slug}`}
      className="card"
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
      id={`content-card-${content.slug}`}
    >
      {/* Cover / Placeholder */}
      <div className="cover-placeholder">
        <img src="/images/feather.jpg" alt="PdfXpress" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem', mixBlendMode: 'screen' }} />
        <span style={{ fontSize: '0.75rem', opacity: 0.7, maxWidth: '80%', textAlign: 'center', lineHeight: 1.3 }}>
          {content.title}
        </span>
      </div>

      {/* Card Body */}
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge ${badge.className}`}>{badge.label}</span>
          {content.year && (
            <span className="badge badge-amber">{content.year}</span>
          )}
        </div>

        <h3 className="card-title">{content.title}</h3>

        <div className="card-meta">
          {content.categoryName && <span>{content.categoryName}</span>}
          {content.examName && (
            <>
              <span className="breadcrumb-separator">›</span>
              <span>{content.examName}</span>
            </>
          )}
        </div>

        {content.subject && (
          <div className="card-meta">
            <span>Subject: {content.subject}</span>
          </div>
        )}

        {content.author && (
          <div className="card-meta">
            <span>Author: {content.author}</span>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
          <span className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            {content.contentType === 'BOOK' ? 'Open Book' : 'Read PDF'}
          </span>
        </div>
      </div>
    </Link>
  );
}
