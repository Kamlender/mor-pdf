/**
 * PdfXpress | Smart Classification Engine
 * 
 * Rule-based filename/title parser that suggests category, exam, and content type.
 * No AI/LLM dependency | uses deterministic keyword matching per TRD.
 */

export interface ClassificationSuggestion {
  category: string | null;
  exam: string | null;
  contentType: string | null;
  confidence: number;
  matchedKeywords: string[];
}

// Keyword maps for classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  SSC: ['ssc', 'staff selection', 'कर्मचारी चयन'],
  RAILWAY: ['railway', 'rrb', 'रेलवे', 'rail', 'indian railway'],
  BANKING: ['banking', 'bank', 'ibps', 'sbi', 'rbi', 'nabard', 'lic', 'बैंकिंग', 'बैंक'],
  STATE_EXAMS: ['uppsc', 'bpsc', 'mppsc', 'rpsc', 'state psc', 'pcs', 'patwari', 'lekhpal', 'state exam', 'राज्य परीक्षा'],
  OTHER_EXAMS: ['upsc', 'nda', 'cds', 'cuet', 'gate', 'net jrf', 'clat', 'cat ', 'afcat', 'epfo', 'esic'],
};

const EXAM_KEYWORDS: Record<string, { category: string; keywords: string[] }> = {
  // SSC Exams
  CGL: { category: 'SSC', keywords: ['cgl', 'combined graduate level', 'सीजीएल'] },
  CHSL: { category: 'SSC', keywords: ['chsl', 'combined higher secondary', 'सीएचएसएल'] },
  MTS: { category: 'SSC', keywords: ['mts', 'multi tasking', 'एमटीएस'] },
  GD: { category: 'SSC', keywords: ['gd', 'gd constable', 'जीडी'] },
  CPO: { category: 'SSC', keywords: ['cpo', 'central police', 'सीपीओ'] },
  STENOGRAPHER: { category: 'SSC', keywords: ['steno', 'stenographer', 'आशुलिपिक'] },
  // Railway Exams
  NTPC: { category: 'RAILWAY', keywords: ['ntpc', 'non technical', 'एनटीपीसी'] },
  'GROUP-D': { category: 'RAILWAY', keywords: ['group d', 'group-d', 'ग्रुप डी', 'level 1'] },
  ALP: { category: 'RAILWAY', keywords: ['alp', 'assistant loco pilot', 'एएलपी'] },
  JE: { category: 'RAILWAY', keywords: ['je ', 'junior engineer', 'जेई'] },
  // Banking Exams
  'IBPS-PO': { category: 'BANKING', keywords: ['ibps po', 'ibps-po', 'आईबीपीएस पीओ'] },
  'IBPS-CLERK': { category: 'BANKING', keywords: ['ibps clerk', 'ibps-clerk', 'आईबीपीएस क्लर्क'] },
  'IBPS-SO': { category: 'BANKING', keywords: ['ibps so', 'ibps-so', 'specialist officer'] },
  'IBPS-RRB': { category: 'BANKING', keywords: ['ibps rrb', 'ibps-rrb', 'regional rural'] },
  'SBI-PO': { category: 'BANKING', keywords: ['sbi po', 'sbi-po', 'एसबीआई पीओ'] },
  'SBI-CLERK': { category: 'BANKING', keywords: ['sbi clerk', 'sbi-clerk', 'एसबीआई क्लर्क'] },
  'RBI-GRADE-B': { category: 'BANKING', keywords: ['rbi grade b', 'rbi-grade-b', 'आरबीआई'] },
  'RBI-ASSISTANT': { category: 'BANKING', keywords: ['rbi assistant', 'rbi-assistant'] },
  NABARD: { category: 'BANKING', keywords: ['nabard', 'नाबार्ड'] },
  'LIC-AAO': { category: 'BANKING', keywords: ['lic aao', 'lic-aao', 'एलआईसी'] },
  // State Exams
  UPPSC: { category: 'STATE_EXAMS', keywords: ['uppsc', 'up pcs', 'यूपीपीएससी'] },
  BPSC: { category: 'STATE_EXAMS', keywords: ['bpsc', 'बीपीएससी', 'bihar psc'] },
  MPPSC: { category: 'STATE_EXAMS', keywords: ['mppsc', 'एमपीपीएससी', 'mp psc'] },
  RPSC: { category: 'STATE_EXAMS', keywords: ['rpsc', 'ras', 'आरपीएससी', 'rajasthan psc'] },
  UKPSC: { category: 'STATE_EXAMS', keywords: ['ukpsc', 'uttarakhand psc'] },
  JPSC: { category: 'STATE_EXAMS', keywords: ['jpsc', 'jharkhand psc'] },
  CGPSC: { category: 'STATE_EXAMS', keywords: ['cgpsc', 'chhattisgarh psc'] },
  HPSC: { category: 'STATE_EXAMS', keywords: ['hpsc', 'hcs', 'haryana psc'] },
  CTET: { category: 'STATE_EXAMS', keywords: ['ctet', 'सीटीईटी', 'teacher eligibility'] },
  UPTET: { category: 'STATE_EXAMS', keywords: ['uptet', 'यूपीटीईटी'] },
  'UP-SI': { category: 'STATE_EXAMS', keywords: ['up si', 'up sub inspector', 'यूपी एसआई'] },
  'UP-LEKHPAL': { category: 'STATE_EXAMS', keywords: ['lekhpal', 'लेखपाल'] },
  'UP-CONSTABLE': { category: 'STATE_EXAMS', keywords: ['up constable', 'यूपी कांस्टेबल'] },
  'MP-PATWARI': { category: 'STATE_EXAMS', keywords: ['mp patwari', 'पटवारी'] },
  // Other Exams
  'UPSC-CSE': { category: 'OTHER_EXAMS', keywords: ['upsc', 'civil services', 'यूपीएससी', 'ias'] },
  NDA: { category: 'OTHER_EXAMS', keywords: ['nda', 'national defence', 'एनडीए'] },
  CDS: { category: 'OTHER_EXAMS', keywords: ['cds', 'combined defence', 'सीडीएस'] },
  CUET: { category: 'OTHER_EXAMS', keywords: ['cuet', 'common university', 'सीयूईटी'] },
  GATE: { category: 'OTHER_EXAMS', keywords: ['gate', 'graduate aptitude', 'गेट'] },
  'NET-JRF': { category: 'OTHER_EXAMS', keywords: ['ugc net', 'net jrf', 'नेट'] },
  AFCAT: { category: 'OTHER_EXAMS', keywords: ['afcat', 'air force'] },
  EPFO: { category: 'OTHER_EXAMS', keywords: ['epfo', 'provident fund'] },
  ESIC: { category: 'OTHER_EXAMS', keywords: ['esic', 'esi corporation'] },
};

const CONTENT_TYPE_KEYWORDS: Record<string, string[]> = {
  BOOK: ['book', 'पुस्तक', 'किताब', 'textbook', 'guide', 'manual'],
  PRACTICE_SET: ['practice set', 'practice paper', 'mock test', 'mock paper', 'अभ्यास', 'प्रैक्टिस सेट'],
  ANSWER_KEY: ['answer key', 'answer sheet', 'उत्तर कुंजी', 'answer', 'ans key'],
  EXAM_PDF: ['previous year', 'question paper', 'exam paper', 'paper', 'प्रश्न पत्र', 'पिछले वर्ष'],
};

/**
 * Classify a PDF based on its filename and/or title.
 * Returns a suggestion with confidence score (0-1).
 */
export function classifyContent(filename: string, title?: string): ClassificationSuggestion {
  const text = `${filename} ${title || ''}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let confidence = 0;

  // Detect category
  let category: string | null = null;
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        category = cat;
        matchedKeywords.push(keyword);
        confidence += 0.3;
        break;
      }
    }
    if (category) break;
  }

  // Detect exam (can also infer category)
  let exam: string | null = null;
  for (const [examName, { category: examCategory, keywords }] of Object.entries(EXAM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        exam = examName;
        if (!category) {
          category = examCategory;
          confidence += 0.2;
        }
        matchedKeywords.push(keyword);
        confidence += 0.3;
        break;
      }
    }
    if (exam) break;
  }

  // Detect content type
  let contentType: string | null = null;
  for (const [type, keywords] of Object.entries(CONTENT_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        contentType = type;
        matchedKeywords.push(keyword);
        confidence += 0.2;
        break;
      }
    }
    if (contentType) break;
  }

  // Default content type if nothing detected
  if (!contentType && category) {
    contentType = 'EXAM_PDF';
    confidence += 0.05;
  }

  // Detect year
  const yearMatch = text.match(/20\d{2}/);
  if (yearMatch) {
    matchedKeywords.push(yearMatch[0]);
    confidence += 0.1;
  }

  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0);

  return {
    category,
    exam,
    contentType,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords,
  };
}

/**
 * Generate a URL-safe slug from a title.
 * Handles Hindi text by removing Devanagari characters and using English portions.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (includes Devanagari)
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '')    // Trim leading/trailing hyphens
    .substring(0, 100);       // Max length
}

/**
 * Generate SEO title from content metadata.
 */
export function generateSeoTitle(
  title: string,
  category?: string,
  exam?: string,
  contentType?: string
): string {
  const parts = [title];
  if (contentType === 'BOOK') parts.push('PDF');
  else if (contentType === 'PRACTICE_SET') parts.push('Practice Set');
  else if (contentType === 'ANSWER_KEY') parts.push('Answer Key');
  
  return `${parts.join(' ')} | PdfXpress`;
}

/**
 * Generate meta description from content metadata.
 */
export function generateMetaDescription(
  title: string,
  category?: string,
  exam?: string,
  contentType?: string,
  year?: number
): string {
  let desc = `${title}`;
  if (exam) desc += ` for ${exam}`;
  if (category) desc += ` (${category})`;
  if (year) desc += ` ${year}`;
  desc += `. Read online on PdfXpress | your educational PDF library.`;
  return desc.substring(0, 160);
}
