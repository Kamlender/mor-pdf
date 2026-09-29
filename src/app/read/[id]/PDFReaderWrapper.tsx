'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const PDFReader = dynamic(() => import('@/components/reader/PDFReader'), { ssr: false });

export default function PDFReaderWrapper(props: any) {
  const router = useRouter();
  
  return (
    <PDFReader 
      {...props} 
      onClose={() => {
        router.back();
      }} 
    />
  );
}
