import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../../services/settings.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings-panel',
  imports: [CommonModule],
  templateUrl: './settings-panel.html',
  styleUrl: './settings-panel.scss',
})
export class SettingsPanel {
  readonly isOpen = input(false);
  readonly closePanel = output<void>();

  protected readonly settings = inject(SettingsService);
  private readonly toast = inject(ToastService);

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

  onLanguageChange(event: Event): void {
    this.settings.update({ language: (event.target as HTMLSelectElement).value });
  }

  onSplitChaptersChange(event: Event): void {
    this.settings.update({ splitChapters: (event.target as HTMLInputElement).checked });
  }

  async onCoverSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.settings.loadCoverFromFile(file);
    } catch {
      this.toast.show('Could not load image. Please use a JPEG or PNG.', 'error');
    }
    (event.target as HTMLInputElement).value = '';
  }

  clearCover(): void {
    this.settings.clearCover();
  }
}
