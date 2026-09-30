import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PdfXpress | Educational PDFs & Books",
  description: "PdfXpress | Competitive exam PDFs, books, practice sets और answer keys के लिए centralized educational reading platform। SSC, Railway और अन्य exams के लिए organized PDF library।",
  keywords: ["SSC", "Railway", "PDF", "Books", "Practice Set", "Answer Key", "CGL", "CHSL", "NTPC", "PdfXpress", "competitive exam"],
  authors: [{ name: "PdfXpress" }],
  openGraph: {
    title: "PdfXpress | Educational PDFs & Books",
    description: "Competitive exam PDFs, books, practice sets और answer keys के लिए centralized educational reading platform।",
    type: "website",
    locale: "hi_IN",
    siteName: "PdfXpress",
  },
  twitter: {
    card: "summary_large_image",
    title: "PdfXpress | Educational PDFs & Books",
    description: "Competitive exam PDFs, books, practice sets और answer keys के लिए educational reading platform।",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/favicon-custom.jpg',
    shortcut: '/images/favicon-custom.jpg',
    apple: '/images/favicon-custom.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>
        {children}
      </body>
    </html>
  );
}
