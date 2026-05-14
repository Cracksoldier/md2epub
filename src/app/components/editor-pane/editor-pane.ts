import {
  Component, inject, computed, ElementRef, ViewChild, HostListener,
} from '@angular/core';
import { EditorStateService } from '../../services/editor-state.service';
import { SettingsService } from '../../services/settings.service';
import { I18nService } from '../../services/i18n.service';
import { ChapterList } from '../chapter-list/chapter-list';

@Component({
  selector: 'app-editor-pane',
  imports: [ChapterList],
  templateUrl: './editor-pane.html',
  styleUrl: './editor-pane.scss',
})
export class EditorPane {
  protected readonly editorState = inject(EditorStateService);
  private readonly settings = inject(SettingsService);
  protected readonly i18n = inject(I18nService);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  isDragOver = false;

  readonly wordCount = computed(() => {
    const text = this.editorState.content().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  readonly showChapterList = computed(() => this.settings.metadata().splitChapters);

  scrollToOffset(offset: number): void {
    const ta = this.textareaRef.nativeElement;
    const lineNumber = ta.value.slice(0, offset).split('\n').length - 1;
    const lineHeight = parseInt(getComputedStyle(ta).lineHeight, 10) || 20;
    ta.scrollTop = lineNumber * lineHeight;
    ta.focus();
    ta.setSelectionRange(offset, offset);
  }

  onInput(event: Event): void {
    this.editorState.setContent((event.target as HTMLTextAreaElement).value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      const ta = event.target as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const newValue = value.slice(0, start) + '  ' + value.slice(end);
      this.editorState.setContent(newValue);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  clear(): void {
    this.editorState.setContent('');
  }

  openFileDialog(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.readFile(file);
    (event.target as HTMLInputElement).value = '';
  }

  onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.readFile(file);
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = e => {
      this.editorState.setContent(e.target?.result as string);
    };
    reader.readAsText(file);
  }
}
