import { Component, inject, input, output } from '@angular/core';
import { SettingsService, CoverRejectedError } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';
import { I18nService } from '../../services/i18n.service';
import { EpubTheme } from '../../models/book-metadata.model';

@Component({
  selector: 'app-settings-panel',
  imports: [],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  readonly isOpen = input(false);
  readonly closePanel = output<void>();

  protected readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  readonly languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'es', label: 'Spanish' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'it', label: 'Italian' },
    { code: 'nl', label: 'Dutch' },
    { code: 'ru', label: 'Russian' },
    { code: 'ja', label: 'Japanese' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ar', label: 'Arabic' },
    { code: 'ko', label: 'Korean' },
  ];

  onTitleChange(event: Event): void {
    this.settings.update({ title: (event.target as HTMLInputElement).value });
  }

  onAuthorChange(event: Event): void {
    this.settings.update({ author: (event.target as HTMLInputElement).value });
  }

  onPublisherChange(event: Event): void {
    this.settings.update({ publisher: (event.target as HTMLInputElement).value });
  }

  onDescriptionChange(event: Event): void {
    this.settings.update({ description: (event.target as HTMLTextAreaElement).value });
  }

  onLanguageChange(event: Event): void {
    this.settings.update({ language: (event.target as HTMLSelectElement).value });
  }

  onEpubThemeChange(event: Event): void {
    this.settings.update({ epubTheme: (event.target as HTMLSelectElement).value as EpubTheme });
  }

  onSplitChaptersChange(event: Event): void {
    this.settings.update({ splitChapters: (event.target as HTMLInputElement).checked });
  }

  async onCoverSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.settings.loadCoverFromFile(file);
    } catch (err) {
      const key = err instanceof CoverRejectedError && err.reason === 'too-large'
        ? 'toast.coverTooLarge'
        : err instanceof CoverRejectedError && err.reason === 'wrong-type'
          ? 'toast.coverWrongType'
          : 'toast.coverLoadError';
      this.toast.show(this.i18n.t(key), 'error');
    }
    (event.target as HTMLInputElement).value = '';
  }

  clearCover(): void {
    this.settings.clearCover();
  }
}
