import { Component, HostListener, inject, signal } from '@angular/core';
import { Toolbar } from './components/toolbar/toolbar';
import { EditorPane } from './components/editor-pane/editor-pane';
import { PreviewPane } from './components/preview-pane/preview-pane';
import { PaneDivider } from './components/pane-divider/pane-divider';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { Toast } from './components/toast/toast';
import { WelcomeModal } from './components/welcome-modal/welcome-modal';
import { EditorStateService } from './services/editor-state.service';
import { SettingsService } from './services/settings.service';
import { EpubService } from './services/epub.service';
import { ToastService } from './services/toast.service';
import { I18nService } from './services/i18n.service';

@Component({
  selector: 'app-root',
  imports: [Toolbar, EditorPane, PreviewPane, PaneDivider, SettingsPanel, Toast, WelcomeModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly editorState = inject(EditorStateService);
  private readonly settings = inject(SettingsService);
  private readonly epub = inject(EpubService);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  readonly settingsOpen = signal(false);
  readonly exportLoading = signal(false);
  readonly mobileView = signal<'editor' | 'preview'>('editor');
  readonly gridColumns = signal(this.initColumns());
  readonly showWelcome = signal(!localStorage.getItem('epub-welcomed'));

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      if (e.key === 'e') { e.preventDefault(); this.onExport(); }
      if (e.key === ',') { e.preventDefault(); this.settingsOpen.update(v => !v); }
    }
  }

  onPaneRatio(ratio: number): void {
    this.gridColumns.set(`${ratio}fr 4px ${1 - ratio}fr`);
    PaneDivider.saveRatio(ratio);
  }

  toggleSettings(): void {
    this.settingsOpen.update(v => !v);
  }

  onWelcomeClosed(): void {
    localStorage.setItem('epub-welcomed', '1');
    this.showWelcome.set(false);
  }

  async onExport(): Promise<void> {
    const content = this.editorState.content();
    if (!content.trim()) {
      this.toast.show(this.i18n.t('toast.nothingToExport'), 'error');
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
      this.toast.show(this.i18n.t('toast.downloaded', filename), 'success');
    } catch (err) {
      console.error('EPUB build failed', err);
      this.toast.show(this.i18n.t('toast.exportFailed'), 'error');
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
