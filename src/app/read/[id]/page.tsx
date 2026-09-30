import { notFound } from 'next/navigation';
import { getContentById } from '@/lib/data';
import PDFReaderWrapper from './PDFReaderWrapper';
import { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

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
    />
  );
}
