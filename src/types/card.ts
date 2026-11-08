export interface BookPlanning {
  authorName: string;
  title: string;          // 가제
  topic: string;          // 관심 주제
  experience: string;     // 자신의 경험
  targetReader: string;   // 예상 독자
  coreMessage: string;    // 전하고 싶은 메시지 (핵심 메시지)
  tableOfContents: string[]; // 목차 초안 (장별 제목들)
  updatedAt: string;
}

export type FontSizeMode = 'normal' | 'large' | 'xlarge';

export interface PresetExample {
  id: string;
  label: string;
  tag: string;
  data: BookPlanning;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedChapters?: string[] | null;
  createdAt: string;
}

export interface VerifiedBook {
  title: string;
  author: string;
  sourceUrl: string;
  inquiryDate: string;
  publisher?: string;
  toneInsight?: string;
  structureInsight?: string;
}

export interface BookSearchInsights {
  toneSummary: string;
  structureSummary: string;
  adviceForAuthor: string;
}

export interface BookSearchData {
  success: boolean;
  query: string;
  inquiryDate: string;
  books: VerifiedBook[];
  generalInsights?: BookSearchInsights;
  groundingSources?: { title: string; uri: string }[];
  errorMessage?: string;
}
