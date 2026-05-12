import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toolbar } from './components/toolbar/toolbar';
import { EditorPane } from './components/editor-pane/editor-pane';
import { PreviewPane } from './components/preview-pane/preview-pane';
import { PaneDivider } from './components/pane-divider/pane-divider';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { Toast } from './components/toast/toast';
import { EditorStateService } from './services/editor-state.service';
import { SettingsService } from './services/settings.service';
import { EpubService } from './services/epub.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, Toolbar, EditorPane, PreviewPane, PaneDivider, SettingsPanel, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly editorState = inject(EditorStateService);
  private readonly settings = inject(SettingsService);
  private readonly epub = inject(EpubService);
  private readonly toast = inject(ToastService);

  readonly settingsOpen = signal(false);
  readonly exportLoading = signal(false);
  readonly gridColumns = signal(this.initColumns());

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      if (e.key === 'e') { e.preventDefault(); this.onExport(); }
      if (e.key === ',') { e.preventDefault(); this.settingsOpen.update(v => !v); }
    }
  }

  onPaneRatio(ratio: number): void {
    this.gridColumns.set(`${ratio}fr ${4 / window.innerWidth * 100}% ${1 - ratio}fr`);
    PaneDivider.saveRatio(ratio);
  }

  toggleSettings(): void {
    this.settingsOpen.update(v => !v);
  }

  async onExport(): Promise<void> {
    const content = this.editorState.content();
    if (!content.trim()) {
      this.toast.show('Nothing to export — add some content first.', 'error');
      return;
    }
    this.exportLoading.set(true);
    try {
      const meta = this.settings.metadata();
      const blob = await this.epub.build(content, meta);
      const filename = this.slugify(meta.title || 'untitled') + '.epub';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      this.toast.show(`"${filename}" downloaded!`, 'success');
    } catch (err) {
      console.error('EPUB build failed', err);
      this.toast.show('Export failed — see console for details.', 'error');
    } finally {
      this.exportLoading.set(false);
    }
  }

  private initColumns(): string {
    const ratio = PaneDivider.loadSavedRatio();
    return `${ratio}fr 4px ${1 - ratio}fr`;
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60) || 'book';
  }
}
