export interface StructuredAnalysis {
  objective: string[];
  methodology: string[];
  findings: string[];
  limitations: string[];
  keyTakeaways: string[];
  hasExplicitLimitations: boolean;
  title?: string;
}

export interface AnalysisStats {
  wordCount: number;
  charCount: number;
  sectionsExtracted: number;
  hasExplicitLimitations: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string | Date;
}

export interface AnalysisRecord {
  id: string;
  _id?: string;
  paperTitle: string;
  rawText: string;
  markdown: string;
  structured: StructuredAnalysis;
  stats: AnalysisStats;
  createdAt: number | string | Date;
  fileName?: string;
  chatHistory?: ChatMessage[];
  database?: 'mongodb' | 'in-memory';
}

export type ViewMode = 'cards' | 'markdown' | 'split' | 'rendered' | 'chat';
