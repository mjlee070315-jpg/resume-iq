export interface SectionScore {
  label: string;
  score: number;
  max: number;
  found: boolean;
  breakdown: { reason: string; points: number }[];
}

export interface CategoryScores {
  ATS: number;
  Leadership: number;
  Technical: number;
  Writing: number;
  Grammar: number;
  Projects: number;
}

export interface TimelineEntry {
  section: string;
  title: string;
  dateText: string;
  startYear: number | null;
}

export interface TargetInfo {
  id: string;
  label: string;
  type: "company" | "school";
}

export interface TargetMatch {
  target: TargetInfo;
  fitScore: number;
  keywords: {
    matched: string[];
    missing: string[];
    matchRatio: number;
  };
  emphasis: {
    actual: Record<string, number>;
    target: Record<string, number>;
    alignmentScore: number;
    weakestCategory: string | null;
  };
  focusAreas: string[];
  recommendations: string[];
}

export interface CustomJobMatch {
  requiredKeywords: string[];
  matched: string[];
  missing: string[];
  matchRatio: number;
  fitScore: number;
  note?: string;
}

export interface AnalysisResult {
  overallScore: number;
  categoryScores: CategoryScores;
  timeline: TimelineEntry[];
  sectionScores: {
    experience: SectionScore;
    projects: SectionScore;
    leadership: SectionScore;
    skills: SectionScore;
  };
  sectionCounts: {
    experience: number;
    projects: number;
    leadership: number;
    skills: number;
  };
  verbHeatmap: Record<string, number>;
  weakVerbs: {
    totalBullets: number;
    weakCount: number;
    overusedCount: number;
    flagged: {
      sentence: string;
      flaggedTerm: string;
      type: "weak" | "overused";
      suggestions: string[];
    }[];
  };
  passiveVoice: {
    totalBullets: number;
    passiveCount: number;
    flaggedSentences: string[];
  };
  quantification: {
    totalBullets: number;
    quantifiedCount: number;
    quantifiedSentences: string[];
    ratio: number;
  };
  grammar: {
    totalBullets: number;
    issueCount: number;
    score: number;
  };
  ats: {
    preset: string;
    matched: string[];
    missing: string[];
    matchRatio: number;
  };
  warnings: string[];
  extractedTextPreview?: string;
  resumeText?: string;
  targetMatch?: TargetMatch;
  customJobMatch?: CustomJobMatch;
  background?: BackgroundProfile;
  formatChecks?: FormatCheck[];
}

export interface BackgroundProfile {
  education: {
    schools: string[];
    degrees: string[];
    gpa: { value: number; scale: number } | null;
  };
  employers: string[];
  contact: { email: boolean; phone: boolean; linkedin: boolean; github: boolean };
  signals: { research: boolean; internship: boolean; leadership: boolean };
  wordCount: number;
  insights: string[];
}

export interface FormatCheck {
  ok: boolean;
  label: string;
  detail: string;
}

export interface BackgroundInsight {
  summary: string;
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
}
