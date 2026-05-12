import { Component, HostListener, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import type { Locale } from '../../i18n/translations';

@Component({
  selector: 'app-welcome-modal',
  imports: [CommonModule],
  templateUrl: './welcome-modal.html',
  styleUrl: './welcome-modal.scss',
})
export class WelcomeModal {
  protected readonly i18n = inject(I18nService);

  readonly close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  onLocaleChange(event: Event): void {
    this.i18n.setLocale((event.target as HTMLSelectElement).value as Locale);
  }
}
