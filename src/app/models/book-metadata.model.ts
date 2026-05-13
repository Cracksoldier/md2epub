export interface BookMetadata {
  title: string;
  author: string;
  publisher: string;
  description: string;
  language: string;
  splitChapters: boolean;
  coverDataUrl: string | null;
  coverMimeType: 'image/jpeg' | 'image/png' | null;
}
