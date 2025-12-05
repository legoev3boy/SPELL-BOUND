export enum AppState {
  AUTH = 'AUTH',
  GRADE_SELECTION = 'GRADE_SELECTION',
  LOADING = 'LOADING',
  PRACTICE = 'PRACTICE',
  FEEDBACK = 'FEEDBACK',
  GLOSSARY = 'GLOSSARY',
  STATS = 'STATS',
}

export interface SentenceData {
  text: string;
  hint: string;
}

export interface FeedbackData {
  isCorrect: boolean;
  userText: string;
  originalText: string;
  diff: {
    part: string;
    correct: boolean;
    userAttempt: string;
  }[];
}

export enum GradeLevel {
  G7 = '7th Grade',
  G8 = '8th Grade',
}

export interface MistakeRecord {
  id: string;
  word: string;
  userSpelling: string;
  originalSentence: string;
  timestamp: number;
  grade: string;
  masteryScore: number; // 0 to 3
}

export interface PracticeSessionRecord {
  id: string;
  timestamp: number;
  grade: string;
  correct: boolean;
  text: string;
}

export interface User {
  username: string;
  email: string;
}