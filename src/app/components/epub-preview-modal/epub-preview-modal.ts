import {
  AfterViewInit, Component, ElementRef, HostListener, ViewChild,
  computed, inject, input, output, signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18nService } from '../../services/i18n.service';
import { MarkdownService } from '../../services/markdown.service';
import { EpubService } from '../../services/epub.service';
import { BookMetadata } from '../../models/book-metadata.model';

const FOCUSABLE = 'button, [tabindex]:not([tabindex="-1"])';

interface PreviewPage {
  label: string;
  html: string;
  isCover: boolean;
}

@Component({
  selector: 'app-epub-preview-modal',
  imports: [],
  templateUrl: './epub-preview-modal.html',
  styleUrl: './epub-preview-modal.scss',
})
export class EpubPreviewModal implements AfterViewInit {
  protected readonly i18n = inject(I18nService);
  private readonly markdown = inject(MarkdownService);
  private readonly epub = inject(EpubService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('card') cardRef!: ElementRef<HTMLElement>;

  readonly markdownText = input.required<string>();
  readonly meta = input.required<BookMetadata>();

  readonly close = output<void>();
  readonly download = output<void>();

  readonly currentIndex = signal(0);

  readonly pages = computed<PreviewPage[]>(() => {
    const meta = this.meta();
    const pages: PreviewPage[] = [];

    if (meta.coverDataUrl) {
      pages.push({
        label: this.i18n.t('epubPreview.coverLabel'),
        html: `<div class="cover-wrap"><img src="${meta.coverDataUrl}" alt=""/></div>`,
        isCover: true,
      });
    }

    const html = this.markdown.parse(this.markdownText());
    if (meta.splitChapters) {
      const chapters = this.markdown.splitIntoChapters(html);
      for (const ch of chapters) {
        pages.push({ label: ch.title, html: ch.htmlContent, isCover: false });
      }
    } else {
      pages.push({
        label: this.markdown.getFirstHeading(html) || meta.title.trim() || this.i18n.t('epubPreview.title'),
        html,
        isCover: false,
      });
    }

    return pages;
  });

  readonly total = computed(() => this.pages().length);
  readonly current = computed(() => this.pages()[this.currentIndex()]);

  /** Chapter count excluding the cover page (if any). */
  readonly chapterCount = computed(() => {
    const pages = this.pages();
    return pages.length - (pages[0]?.isCover ? 1 : 0);
  });

  /** 1-based chapter index of the current page (undefined when on the cover). */
  readonly chapterIndex = computed(() => {
    const pages = this.pages();
    const idx = this.currentIndex();
    if (pages[0]?.isCover) return idx; // cover is index 0; chapters start at index 1
    return idx + 1;
  });

  readonly srcdoc = computed<SafeHtml>(() => {
    const page = this.current();
    const meta = this.meta();
    const css = page.isCover ? COVER_CSS : this.epub.themeCss(meta.epubTheme, meta.epubFont, meta.dropCaps);
    const lang = meta.language || 'en';
    const doc =
      `<!DOCTYPE html>` +
      `<html lang="${escapeAttr(lang)}"><head><meta charset="UTF-8"/><style>${css}</style></head>` +
      `<body>${page.html}</body></html>`;
    return this.sanitizer.bypassSecurityTrustHtml(doc);
  });

  ngAfterViewInit(): void {
    this.cardRef.nativeElement.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }

  prev(): void {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  next(): void {
    if (this.currentIndex() < this.total() - 1) this.currentIndex.update(i => i + 1);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void { this.prev(); }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void { this.next(); }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(this.cardRef.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
}

const COVER_CSS = `
  html, body { margin: 0; padding: 0; height: 100%; background: #0a1628; }
  .cover-wrap { display: flex; align-items: center; justify-content: center; height: 100vh; }
  .cover-wrap img { max-width: 100%; max-height: 100vh; object-fit: contain; display: block; }
`;

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
