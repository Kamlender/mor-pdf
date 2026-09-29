import Link from 'next/link';

interface Props {
  contentId: string;
  contentType: string;
  title: string;
  pdfFileId: string;
}

export default function PDFReaderLauncher({ contentId, contentType, title, pdfFileId }: Props) {
  const isBook = contentType === 'BOOK';

  return (
    <Link
      href={`/read/${contentId}`}
      className={`btn ${isBook ? 'btn-gold' : 'btn-primary'} btn-lg`}
      id="open-reader-btn"
      style={{ gap: '0.5rem', display: 'inline-flex', alignItems: 'center' }}
    >
      {isBook ? 'Open Book' : 'Read PDF'}
    </Link>
  );
}
