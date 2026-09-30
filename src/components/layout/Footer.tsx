import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/images/feather.jpg" alt="PdfXpress Logo" style={{ width: '32px', height: '32px', borderRadius: '4px', mixBlendMode: 'screen' }} />
              <span><span className="gradient-text">Pdf</span>Xpress</span>
            </div>
            <p className="footer-brand-desc">
              Competitive exam PDFs, books, practice sets और study material के लिए आपका centralized educational reading platform।
            </p>
          </div>

          <div>
            <h4 className="footer-column-title">Subjects</h4>
            <ul className="footer-links">
              <li><Link href="/gk-gs">GK/GS</Link></li>
              <li><Link href="/mathematics">Mathematics</Link></li>
              <li><Link href="/reasoning">Reasoning</Link></li>
              <li><Link href="/english">English</Link></li>
              <li><Link href="/hindi">Hindi</Link></li>
              <li><Link href="/computer">Computer</Link></li>
              <li><Link href="/science">Science</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/others">Others</Link></li>
              <li><Link href="/search">Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Admin</h4>
            <ul className="footer-links">
              <li><Link href="/admin">Admin Panel</Link></li>
              <li><Link href="/admin/upload">Upload PDF</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} PdfXpress | Educational PDF Reading Platform</p>
          <span style={{ color: 'var(--color-border-dark-2)' }}>|</span>
          <a 
            href="https://tinytoono.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'color 0.2s ease' }}
          >
            Designed & built by <strong style={{ color: 'var(--color-text-primary)' }}>ZYROO STUDIO</strong>
          </a>
        </div>
      </div>
    </footer>
  );
}
