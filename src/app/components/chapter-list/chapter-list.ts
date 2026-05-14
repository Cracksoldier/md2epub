import { Component, inject, computed, output, signal } from '@angular/core';
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

  private readonly dragFromIndex = signal<number | null>(null);
  private readonly dragOverIndex = signal<number | null>(null);
  protected readonly dragFrom = this.dragFromIndex.asReadonly();
  protected readonly dragOver = this.dragOverIndex.asReadonly();
  protected readonly isDragging = computed(() => this.dragFromIndex() !== null);

  onDragStart(event: DragEvent, index: number): void {
    this.dragFromIndex.set(index);
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(index));
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverIndex.set(index);
  }

  onDragLeave(event: DragEvent, index: number): void {
    const related = event.relatedTarget as Node | null;
    if (!(event.currentTarget as HTMLElement).contains(related)) {
      if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
    }
  }

  onDrop(event: DragEvent, toIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    const fromIndex = this.dragFromIndex();
    if (fromIndex !== null && fromIndex !== toIndex) {
      this.editorState.setContent(
        this.markdown.reorderMarkdownChapters(this.editorState.content(), fromIndex, toIndex)
      );
    }
    this.dragFromIndex.set(null);
    this.dragOverIndex.set(null);
  }

  onDragEnd(): void {
    this.dragFromIndex.set(null);
    this.dragOverIndex.set(null);
  }
}
