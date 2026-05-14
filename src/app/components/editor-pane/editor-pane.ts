import {
  Component, inject, computed, effect, ElementRef, ViewChild, HostListener, input, output,
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

  readonly syncScrollRatio = input<number>(NaN);
  readonly scrollRatio = output<number>();

  private scrolling = false;
  private scrollRafId = 0;

  isDragOver = false;

  constructor() {
    effect(() => {
      const ratio = this.syncScrollRatio();
      if (!isFinite(ratio) || this.scrolling) return;
      const ta = this.textareaRef?.nativeElement;
      if (!ta) return;
      this.scrolling = true;
      ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight);
      setTimeout(() => { this.scrolling = false; }, 50);
    });
  }

  onEditorScroll(event: Event): void {
    if (this.scrolling) return;
    cancelAnimationFrame(this.scrollRafId);
    this.scrollRafId = requestAnimationFrame(() => {
      const ta = event.target as HTMLTextAreaElement;
      const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight);
      if (isFinite(ratio)) this.scrollRatio.emit(ratio);
    });
  }

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

  format(type: 'h1' | 'h2' | 'bold' | 'italic' | 'code' | 'link' | 'quote' | 'ul'): void {
    const ta = this.textareaRef.nativeElement;
    const { selectionStart: ss, selectionEnd: se, value } = ta;

    const INLINE: Record<string, [string, string, string]> = {
      bold:   ['**', '**', 'bold text'],
      italic: ['*',  '*',  'italic text'],
      code:   ['`',  '`',  'code'],
      link:   ['[',  '](url)', 'link text'],
    };
    const BLOCK: Record<string, string> = {
      h1: '# ', h2: '## ', quote: '> ', ul: '- ',
    };

    if (type in INLINE) {
      const [pre, suf, placeholder] = INLINE[type];
      const selected = value.slice(ss, se) || placeholder;
      const replacement = pre + selected + suf;
      this.applyReplacement(ta, ss, se, replacement, ss + pre.length, ss + pre.length + selected.length);
    } else {
      this.applyBlockPrefix(ta, ss, se, BLOCK[type]);
    }
    ta.focus();
  }

  private applyReplacement(
    ta: HTMLTextAreaElement,
    start: number, end: number,
    text: string,
    selectStart: number, selectEnd: number,
  ): void {
    this.editorState.setContent(ta.value.slice(0, start) + text + ta.value.slice(end));
    setTimeout(() => ta.setSelectionRange(selectStart, selectEnd));
  }

  private applyBlockPrefix(
    ta: HTMLTextAreaElement,
    ss: number, se: number,
    prefix: string,
  ): void {
    const value = ta.value;
    const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
    const lineEndIdx = value.indexOf('\n', se);
    const blockEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const lines = value.slice(lineStart, blockEnd).split('\n');
    const allPrefixed = lines.every(l => l.startsWith(prefix));
    const newLines = allPrefixed ? lines.map(l => l.slice(prefix.length)) : lines.map(l => prefix + l);
    const replacement = newLines.join('\n');
    const delta = replacement.length - (blockEnd - lineStart);
    this.applyReplacement(ta, lineStart, blockEnd, replacement, ss, se + delta);
  }

  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
      if (event.key === 'b') { event.preventDefault(); this.format('bold'); return; }
      if (event.key === 'i') { event.preventDefault(); this.format('italic'); return; }
    }
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
