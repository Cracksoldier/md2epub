import { Component, computed, inject } from '@angular/core';
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
  private readonly editorState = inject(EditorStateService);
  private readonly markdownService = inject(MarkdownService);
  private readonly settingsService = inject(SettingsService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);

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
