import { Component, inject, computed, output } from '@angular/core';
import { EditorStateService } from '../../services/editor-state.service';
import { MarkdownService } from '../../services/markdown.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-chapter-list',
  imports: [],
  templateUrl: './chapter-list.html',
  styleUrl: './chapter-list.scss',
})
export class ChapterList {
  readonly chapterSelect = output<number>();

  private readonly editorState = inject(EditorStateService);
  private readonly markdown = inject(MarkdownService);
  protected readonly i18n = inject(I18nService);

  readonly chapters = computed(() =>
    this.markdown.getChapterHeadings(this.editorState.content())
  );
}
