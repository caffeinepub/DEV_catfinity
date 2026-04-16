export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  estimatedMinutes: number;
  sections: LessonSection[];
}

export interface LessonSection {
  heading: string;
  content: LessonContent[];
}

export type LessonContent =
  | { type: "paragraph"; text: string }
  | { type: "math-block"; latex: string }
  | { type: "math-inline-paragraph"; parts: InlinePart[] }
  | { type: "definition"; term: string; body: InlinePart[] }
  | { type: "example"; body: InlinePart[] };

export type InlinePart =
  | { kind: "text"; text: string }
  | { kind: "math"; latex: string };

export interface CompletedLesson {
  lessonId: string;
  completedAt: bigint;
}

export interface TokenStatus {
  hasToken: boolean;
  isExpired: boolean;
  hasRefreshToken: boolean;
}

export interface TweetResult {
  success: boolean;
  message: string;
}

export interface LessonProgress {
  lessonId: string;
  completedAt: number;
}
