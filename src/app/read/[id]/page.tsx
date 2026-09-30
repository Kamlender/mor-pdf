import { notFound } from 'next/navigation';
import { getContentById, getPublishedContents } from '@/lib/data';
import PDFReaderWrapper from './PDFReaderWrapper';
import { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  try {
    const allContents = await getPublishedContents({ limit: 9999 });
    return allContents.map((c: any) => ({ id: c.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let content = null;
  try {
    content = await getContentById(id);
  } catch (e) { }

  if (!content) return { title: 'Not Found | PdfXpress' };
  
  return {
    title: `Reading: ${content.title} | PdfXpress`,
  };
}

export default async function ReadPdfPage({ params }: Props) {
  const { id } = await params;
  let content = null;
  try {
    content = await getContentById(id);
  } catch (e) { }

  if (!content) return notFound();

  return (
    <PDFReaderWrapper 
      contentId={content.id} 
      title={content.title} 
      isBook={content.contentType === 'BOOK'}
      pdfPath={content.pdfPath || `/uploads/${content.pdfFileId}.pdf`}
    />
  );
}
