import { Component, computed, effect, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';
import DOMPurify from 'dompurify';
import { EditorStateService } from '../../services/editor-state.service';
import { MarkdownService } from '../../services/markdown.service';
import { SettingsService } from '../../services/settings.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-preview-pane',
  imports: [],
  templateUrl: './preview-pane.html',
  styleUrl: './preview-pane.scss',
})
export class PreviewPane {
  @ViewChild('scrollContainer') private scrollContainerRef!: ElementRef<HTMLElement>;

  readonly syncScrollRatio = input<number>(NaN);
  readonly scrollRatio = output<number>();

  private scrolling = false;
  private scrollRafId = 0;

  private readonly editorState = inject(EditorStateService);
  private readonly markdownService = inject(MarkdownService);
  private readonly settingsService = inject(SettingsService);
  private readonly sanitizer = inject(DomSanitizer);
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
      DOMPurify.sanitize(this.rawHtml(), { USE_PROFILES: { html: true } }),
    )
  );

  readonly chapterCount = computed(() => {
    const meta = this.settingsService.metadata();
    if (!meta.splitChapters) return 0;
    return this.markdownService.splitIntoChapters(this.rawHtml()).length;
  });
}
