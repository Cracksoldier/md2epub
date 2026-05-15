export function sanitizeCss(css: string): string {
  return css
    .replace(/<\/?[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/@import\s+[^;]+;?/gi, '');
}
