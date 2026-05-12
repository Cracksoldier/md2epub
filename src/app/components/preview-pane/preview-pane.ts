import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map } from 'rxjs';
import { EditorStateService } from '../../services/editor-state.service';
import { MarkdownService } from '../../services/markdown.service';
import { SettingsService } from '../../services/settings.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-preview-pane',
  imports: [CommonModule],
  templateUrl: './preview-pane.html',
  styleUrl: './preview-pane.scss',
})
export class PreviewPane {
  private readonly editorState = inject(EditorStateService);
  private readonly markdownService = inject(MarkdownService);
  private readonly settingsService = inject(SettingsService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);

  readonly safeHtml = toSignal(
    toObservable(this.editorState.content).pipe(
      debounceTime(200),
      map(md => this.sanitizer.bypassSecurityTrustHtml(this.markdownService.parse(md))),
    ),
    { initialValue: this.sanitizer.bypassSecurityTrustHtml(this.markdownService.parse(this.editorState.content())) },
  );

  readonly chapterCount = computed(() => {
    const meta = this.settingsService.metadata();
    if (!meta.splitChapters) return 0;
    const html = this.markdownService.parse(this.editorState.content());
    return this.markdownService.splitIntoChapters(html).length;
  });
}
