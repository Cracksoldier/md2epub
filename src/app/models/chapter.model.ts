export interface Subchapter {
  title: string;
  id: string;
}

export interface Chapter {
  title: string;
  filename: string;
  htmlContent: string;
  subchapters: Subchapter[];
}
