import { Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { Toolbar } from './components/toolbar/toolbar';
import { EditorPane } from './components/editor-pane/editor-pane';
import { PreviewPane } from './components/preview-pane/preview-pane';
import { PaneDivider } from './components/pane-divider/pane-divider';
import { SettingsPanel } from './components/settings-panel/settings-panel';
import { Toast } from './components/toast/toast';
import { WelcomeModal } from './components/welcome-modal/welcome-modal';
import { ShortcutsModal } from './components/shortcuts-modal/shortcuts-modal';
import { EpubPreviewModal } from './components/epub-preview-modal/epub-preview-modal';
import { EditorStateService } from './services/editor-state.service';
import { SettingsService } from './services/settings.service';
import { EpubService } from './services/epub.service';
import { ToastService } from './services/toast.service';
import { I18nService } from './services/i18n.service';
import { ImagesService } from './services/images.service';
import { readStorage, writeStorage } from './utils/storage';

@Component({
  selector: 'app-root',
  imports: [Toolbar, EditorPane, PreviewPane, PaneDivider, SettingsPanel, Toast, WelcomeModal, ShortcutsModal, EpubPreviewModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly editorState = inject(EditorStateService);
  protected readonly settings = inject(SettingsService);
  private readonly epub = inject(EpubService);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);
  private readonly images = inject(ImagesService);

  @ViewChild('projectFileInput') private projectFileInput!: ElementRef<HTMLInputElement>;

  readonly settingsOpen = signal(false);
  readonly editorScrollRatio = signal(NaN);
  readonly previewScrollRatio = signal(NaN);
  readonly exportLoading = signal(false);
  readonly mobileView = signal<'editor' | 'preview'>('editor');
  readonly gridColumns = signal(this.initColumns());
  readonly showWelcome = signal(!readStorage('welcomed', 'epub-welcomed'));
  readonly showShortcuts = signal(false);
  readonly showEpubPreview = signal(false);

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      if (!e.shiftKey && e.key === 'e') { e.preventDefault(); this.onExport(); }
      if (!e.shiftKey && e.key === ',') { e.preventDefault(); this.settingsOpen.update(v => !v); }
      if (e.key === '?') { e.preventDefault(); this.showShortcuts.update(v => !v); }
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) { e.preventDefault(); this.onPreviewEpub(); }
    }
  }

  onPreviewEpub(): void {
    if (!this.editorState.content().trim()) {
      this.toast.show(this.i18n.t('toast.nothingToExport'), 'error');
      return;
    }
    this.showEpubPreview.set(true);
  }

  onPreviewDownload(): void {
    this.showEpubPreview.set(false);
    this.onExport();
  }

  onPaneRatio(ratio: number): void {
    this.gridColumns.set(`${ratio}fr 4px ${1 - ratio}fr`);
    PaneDivider.saveRatio(ratio);
  }

  toggleSettings(): void {
    this.settingsOpen.update(v => !v);
  }

  onWelcomeClosed(): void {
    writeStorage('welcomed', '1');
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

  onSaveProject(): void {
    const payload = JSON.stringify({
      version: 2,
      content: this.editorState.content(),
      metadata: this.settings.metadata(),
      images: this.images.serialize(),
    });
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const title = this.settings.metadata().title.trim() || 'untitled';
    anchor.href = url;
    anchor.download = `${this.slugify(title)}.epub-project.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast.show(this.i18n.t('toast.projectSaved'), 'success');
  }

  onLoadProject(): void {
    this.projectFileInput.nativeElement.click();
  }

  onProjectFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version || !data.content || !data.metadata) throw new Error();
        this.editorState.setContent(data.content);
        this.settings.update(data.metadata);
        this.images.restore(data.version >= 2 ? (data.images ?? {}) : {});
        this.toast.show(this.i18n.t('toast.projectLoaded', file.name), 'success');
      } catch {
        this.toast.show(this.i18n.t('toast.projectLoadError'), 'error');
      }
      (event.target as HTMLInputElement).value = '';
    };
    reader.readAsText(file);
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
