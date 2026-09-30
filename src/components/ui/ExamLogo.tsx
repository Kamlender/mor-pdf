/**
 * ExamLogo | Centralized logo component for all exam categories.
 * Maps exam/category slugs to their official logo images.
 * Falls back to a styled abbreviation badge for exams without dedicated logos.
 */

// Logo image mapping | exams with dedicated logo images
const LOGO_IMAGES: Record<string, string> = {
  // Main categories
  'ssc': '/images/logos/ssc.jpg',
  'railway': '/images/logos/railway.jpg',
  'banking': '/images/logos/ibps.jpg',
  'state-exams': '/images/logos/state-psc.jpg',
  'other-exams': '/images/logos/upsc.jpg',
  // Banking
  'ibps-po': '/images/logos/ibps.jpg',
  'ibps-clerk': '/images/logos/ibps.jpg',
  'ibps-so': '/images/logos/ibps.jpg',
  'ibps-rrb': '/images/logos/ibps.jpg',
  'sbi-po': '/images/logos/sbi.jpg',
  'sbi-clerk': '/images/logos/sbi.jpg',
  'rbi-grade-b': '/images/logos/rbi.jpg',
  'rbi-assistant': '/images/logos/rbi.jpg',
  'nabard': '/images/logos/nabard.jpg',
  'lic-aao': '/images/logos/lic.jpg',
  // Other exams
  'upsc-cse': '/images/logos/upsc.jpg',
  'nda': '/images/logos/nda.jpg',
  'cds': '/images/logos/nda.jpg',
  'afcat': '/images/logos/nda.jpg',
  // State exams (all use state-psc logo)
  'uppsc': '/images/logos/state-psc.jpg',
  'bpsc': '/images/logos/state-psc.jpg',
  'mppsc': '/images/logos/state-psc.jpg',
  'rpsc': '/images/logos/state-psc.jpg',
  'ukpsc': '/images/logos/state-psc.jpg',
  'jpsc': '/images/logos/state-psc.jpg',
  'cgpsc': '/images/logos/state-psc.jpg',
  'hpsc': '/images/logos/state-psc.jpg',
  'wbpsc': '/images/logos/state-psc.jpg',
  'tnpsc': '/images/logos/state-psc.jpg',
  'kpsc': '/images/logos/state-psc.jpg',
  'appsc': '/images/logos/state-psc.jpg',
  'tspsc': '/images/logos/state-psc.jpg',
  'gpsc': '/images/logos/state-psc.jpg',
  'opsc': '/images/logos/state-psc.jpg',
  'ppsc': '/images/logos/state-psc.jpg',
  'hppsc': '/images/logos/state-psc.jpg',
  'apsc': '/images/logos/state-psc.jpg',
};

// Brand colors for CSS-based fallback badges
const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  // SSC sub-exams
  'cgl': { bg: '#0F766E', text: '#fff' },
  'chsl': { bg: '#0E7490', text: '#fff' },
  'mts': { bg: '#1D4ED8', text: '#fff' },
  'gd': { bg: '#166534', text: '#fff' },
  'cpo': { bg: '#1E3A5F', text: '#fff' },
  'stenographer': { bg: '#4338CA', text: '#fff' },
  // Railway sub-exams
  'ntpc': { bg: '#1E3A5F', text: '#fff' },
  'group-d': { bg: '#991B1B', text: '#fff' },
  'alp': { bg: '#B45309', text: '#fff' },
  'je': { bg: '#0369A1', text: '#fff' },
  // Banking fallbacks
  'niacl': { bg: '#1E40AF', text: '#fff' },
  'idbi': { bg: '#065F46', text: '#fff' },
  // State-level exams without PSC logos
  'up-lekhpal': { bg: '#7C2D12', text: '#fff' },
  'up-si': { bg: '#78350F', text: '#fff' },
  'up-constable': { bg: '#713F12', text: '#fff' },
  'bihar-si': { bg: '#831843', text: '#fff' },
  'bihar-constable': { bg: '#9F1239', text: '#fff' },
  'mp-si': { bg: '#6B21A8', text: '#fff' },
  'mp-patwari': { bg: '#7E22CE', text: '#fff' },
  'rajasthan-patwari': { bg: '#A16207', text: '#fff' },
  'rajasthan-police': { bg: '#B91C1C', text: '#fff' },
  'ctet': { bg: '#0F766E', text: '#fff' },
  'uptet': { bg: '#0E7490', text: '#fff' },
  'super-tet': { bg: '#1D4ED8', text: '#fff' },
  // Other exams fallbacks
  'cuet': { bg: '#7C3AED', text: '#fff' },
  'gate': { bg: '#374151', text: '#fff' },
  'net-jrf': { bg: '#4338CA', text: '#fff' },
  'clat': { bg: '#1E3A5F', text: '#fff' },
  'cat': { bg: '#0F766E', text: '#fff' },
  'rrb-po': { bg: '#1E3A5F', text: '#fff' },
  'epfo': { bg: '#065F46', text: '#fff' },
  'esic': { bg: '#1E40AF', text: '#fff' },
  // Generic
  'books': { bg: '#B8922E', text: '#fff' },
  'practice-sets': { bg: '#5B21B6', text: '#fff' },
  'answer-keys': { bg: '#047857', text: '#fff' },
};

// Get short abbreviation for CSS badge
function getAbbreviation(slug: string): string {
  const map: Record<string, string> = {
    'cgl': 'CGL',
    'chsl': 'CHSL',
    'mts': 'MTS',
    'gd': 'GD',
    'cpo': 'CPO',
    'stenographer': 'STENO',
    'ntpc': 'NTPC',
    'group-d': 'GRP D',
    'alp': 'ALP',
    'je': 'JE',
    'niacl': 'NIACL',
    'idbi': 'IDBI',
    'up-lekhpal': 'UP',
    'up-si': 'UP SI',
    'up-constable': 'UP',
    'bihar-si': 'BIH SI',
    'bihar-constable': 'BIH',
    'mp-si': 'MP SI',
    'mp-patwari': 'MP',
    'rajasthan-patwari': 'RAJ',
    'rajasthan-police': 'RAJ',
    'ctet': 'CTET',
    'uptet': 'UPTET',
    'super-tet': 'TET',
    'cuet': 'CUET',
    'gate': 'GATE',
    'net-jrf': 'NET',
    'clat': 'CLAT',
    'cat': 'CAT',
    'rrb-po': 'RRB',
    'epfo': 'EPFO',
    'esic': 'ESIC',
    'books': 'B',
    'practice-sets': 'PS',
    'answer-keys': 'AK',
  };
  return map[slug] || slug.toUpperCase().replace(/-/g, ' ').slice(0, 5);
}

interface ExamLogoProps {
  slug: string;
  size?: number;
  alt?: string;
  className?: string;
}

export default function ExamLogo({ slug, size = 40, alt, className = '' }: ExamLogoProps) {
  const logoSrc = LOGO_IMAGES[slug];

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={alt || slug}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  // CSS fallback badge
  const colors = BRAND_COLORS[slug] || { bg: '#374151', text: '#fff' };
  const abbr = getAbbreviation(slug);

  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: size * 0.3,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}
      aria-label={alt || slug}
    >
      {abbr}
    </span>
  );
}
