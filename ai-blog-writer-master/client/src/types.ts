export interface FAQ {
  question: string;
  answer: string;
}

export interface Blog {
  id: string;
  topic: string;
  targetKeywords: string;
  tone: string;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  content: string;
  faq: FAQ[];
  schemaMarkup: string;
  readabilityScore: number;
  wordCount: number;
  createdAt: number;
}

export interface BlogListItem {
  id: string;
  topic: string;
  targetKeywords: string;
  tone: string;
  seoTitle: string;
  wordCount: number;
  readabilityScore?: number;
  createdAt: number;
}

export interface GenerateBlogRequest {
  topic: string;
  targetKeywords: string;
  tone?: string;
  targetAudience?: string;
  wordCount?: number;
  includeFAQ?: boolean;
}
