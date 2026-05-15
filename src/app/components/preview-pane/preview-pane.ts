import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, output, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';
import DOMPurify from 'dompurify';
import { EditorStateService } from '../../services/editor-state.service';
import { MarkdownService } from '../../services/markdown.service';
import { SettingsService } from '../../services/settings.service';
import { I18nService } from '../../services/i18n.service';
import { sanitizeCss } from '../../utils/sanitize-css';

@Component({
  selector: 'app-preview-pane',
  imports: [],
  templateUrl: './preview-pane.html',
  styleUrl: './preview-pane.scss',
})
export class PreviewPane implements AfterViewInit {
  @ViewChild('scrollContainer') private scrollContainerRef!: ElementRef<HTMLElement>;

  readonly syncScrollRatio = input<number>(NaN);
  readonly scrollRatio = output<number>();

  private scrolling = false;
  private scrollRafId = 0;
  private customCssEl: HTMLStyleElement | null = null;

  private readonly editorState = inject(EditorStateService);
  private readonly markdownService = inject(MarkdownService);
  private readonly settingsService = inject(SettingsService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly renderer = inject(Renderer2);
  protected readonly i18n = inject(I18nService);

  constructor() {
    effect(() => {
      const ratio = this.syncScrollRatio();
      if (!isFinite(ratio) || this.scrolling) return;
      const el = this.scrollContainerRef?.nativeElement;
      if (!el) return;
      this.scrolling = true;
      el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
      setTimeout(() => { this.scrolling = false; }, 50);
    });

    effect(() => {
      const css = this.settingsService.metadata().customCss;
      if (this.customCssEl) this.customCssEl.textContent = sanitizeCss(css);
    });
  }

  ngAfterViewInit(): void {
    this.customCssEl = this.renderer.createElement('style') as HTMLStyleElement;
    this.customCssEl.textContent = sanitizeCss(this.settingsService.metadata().customCss);
    this.renderer.appendChild(this.scrollContainerRef.nativeElement, this.customCssEl);
  }

  onPreviewScroll(event: Event): void {
    if (this.scrolling) return;
    cancelAnimationFrame(this.scrollRafId);
    this.scrollRafId = requestAnimationFrame(() => {
      const el = event.target as HTMLElement;
      const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight);
      if (isFinite(ratio)) this.scrollRatio.emit(ratio);
    });
  }

  // Single debounced parse — both safeHtml and chapterCount consume this
  private readonly rawHtml = toSignal(
    toObservable(this.editorState.content).pipe(
      debounceTime(200),
      map(md => this.markdownService.parse(md)),
    ),
    { initialValue: this.markdownService.parse(this.editorState.content()) },
  );

  readonly safeHtml = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      DOMPurify.sanitize(this.rawHtml(), { USE_PROFILES: { html: true, mathMl: true } }),
    )
  );

  readonly chapterCount = computed(() => {
    const meta = this.settingsService.metadata();
    if (!meta.splitChapters) return 0;
    return this.markdownService.splitIntoChapters(this.rawHtml()).length;
  });
}
