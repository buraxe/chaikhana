export interface LessonText {
  summary: string;
  history: string;
  /** Cultural significance; written for the traditional Chinese puzzles. */
  culture?: string;
  rules: string[];
  basics: string[];
  advanced: string[];
  mistakes: string[];
}
export interface Lesson {
  names: { en: string; zh: string; tr?: string; trad?: string; pinyin?: string };
  en: LessonText;
  zh: LessonText;
  tr?: LessonText;
}
