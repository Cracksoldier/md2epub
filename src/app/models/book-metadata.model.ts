export type EpubTheme = 'classic' | 'modern' | 'minimal';
export type ChapterNumbering = 'none' | 'arabic' | 'roman' | 'word';
export type EpubFont = 'serif' | 'sans' | 'modern-sans' | 'mono' | 'georgia';

export interface BookMetadata {
  title: string;
  author: string;
  publisher: string;
  description: string;
  language: string;
  epubTheme: EpubTheme;
  epubFont: EpubFont;
  chapterNumbering: ChapterNumbering;
  dropCaps: boolean;
  splitChapters: boolean;
  customCss: string;
  coverDataUrl: string | null;
  coverMimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
}
