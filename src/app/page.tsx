import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContentCard from '@/components/content/ContentCard';
import { getPublishedContents, getSubjectCounts, SUBJECTS } from '@/lib/data';

// Subject cards with gradients and emoji icons
const SUBJECT_CARDS = [
  {
    href: '/gk-gs',
    slug: 'gk-gs',
    title: 'GK/GS',
    description: 'General Knowledge & General Studies',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #059669 100%)',
    icon: '🌍',
  },
  {
    href: '/mathematics',
    slug: 'mathematics',
    title: 'Mathematics',
    description: 'Maths, Algebra, Geometry, Arithmetic',
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
    icon: '📐',
  },
  {
    href: '/reasoning',
    slug: 'reasoning',
    title: 'Reasoning',
    description: 'Logical & Analytical Reasoning',
    gradient: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
    icon: '🧠',
  },
  {
    href: '/english',
    slug: 'english',
    title: 'English',
    description: 'English Language & Grammar',
    gradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
    icon: '📝',
  },
  {
    href: '/hindi',
    slug: 'hindi',
    title: 'Hindi',
    description: 'हिन्दी भाषा एवं व्याकरण',
    gradient: 'linear-gradient(135deg, #BE185D 0%, #DB2777 100%)',
    icon: '📖',
  },
  {
    href: '/computer',
    slug: 'computer',
    title: 'Computer',
    description: 'Computer Knowledge & Awareness',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    icon: '💻',
  },
  {
    href: '/science',
    slug: 'science',
    title: 'Science',
    description: 'Physics, Chemistry, Biology & General Science',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    icon: '🔬',
  },
  {
    href: '/others',
    slug: 'others',
    title: 'Others',
    description: 'Other study material & PDFs',
    gradient: 'linear-gradient(135deg, #D4A843 0%, #B8922E 100%)',
    icon: '📚',
  },
  {
    href: '/answer-keys',
    slug: 'answer-keys',
    title: 'Answer Keys',
    description: 'Exam-wise organized Answer Key PDFs',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    icon: '🔑',
  },
];

export default async function HomePage() {
  // Fetch latest published content
  let latestContents: any[] = [];
  let subjectCounts: Record<string, number> = {};
  try {
    latestContents = await getPublishedContents({ limit: 8 });
    subjectCounts = await getSubjectCounts();
  } catch (e) {
    // DB might not be seeded yet
  }

  return (
    <>
      <Header />

      <main>
        {/* ─── HERO SECTION ─── */}
        <section className="hero" id="hero-section">
          <img
            src="/images/logo.png"
            alt=""
            className="hero-feather"
            aria-hidden="true"
          />

          <div className="hero-content container">
            <h1 className="hero-title animate-in">
              <span className="gradient-text">Pdf</span>Xpress
            </h1>
            <p className="hero-subtitle animate-in animate-delay-1">
              Educational PDFs और Books के लिए centralized reading platform।
              Subject-wise organized study material | GK/GS, Maths, Reasoning, English, Hindi, Computer Science।
            </p>

          </div>
        </section>

        {/* ─── SUBJECTS ─── */}
        <section className="section container" id="subjects-section">
          <div className="section-header">
            <h2 className="section-title">Browse by Subject</h2>
          </div>

          <div className="grid-categories">
            {SUBJECT_CARDS.map((sub, i) => (
              <Link
                key={sub.href}
                href={sub.href}
                className={`category-card animate-in animate-delay-${i + 1}`}
                id={`subject-${sub.slug}`}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: sub.gradient,
                    opacity: 0.08,
                  }}
                />
                <span className="category-card-icon" style={{ fontSize: '2.5rem' }}>
                  {sub.icon}
                </span>
                <span className="category-card-title">{sub.title}</span>
                <span className="category-card-count">
                  {sub.description}
                  {subjectCounts[sub.title] ? ` • ${subjectCounts[sub.title]} PDFs` : 
                   sub.slug === 'others' && subjectCounts['Others'] ? ` • ${subjectCounts['Others']} PDFs` : ''}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── LATEST CONTENT ─── */}
        <section className="section container" id="latest-content-section">
          <div className="section-header">
            <h2 className="section-title">Latest Content</h2>
            <Link href="/search" className="section-link">
              View All →
            </Link>
          </div>

          {latestContents.length > 0 ? (
            <div className="grid-cards">
              {latestContents.map((content: any) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ fontSize: '3rem', opacity: 0.5 }}>
                📚
              </div>
              <h3 className="empty-state-title">No content yet</h3>
              <p className="empty-state-desc">
                Content will appear here once published via the admin panel.
                <br />
                <Link href="/admin" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  Go to Admin Panel →
                </Link>
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
