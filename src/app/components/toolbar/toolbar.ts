import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import type { Locale } from '../../i18n/translations';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  protected readonly i18n = inject(I18nService);

  readonly exportLoading = input(false);

  readonly importClick = output<void>();
  readonly settingsClick = output<void>();
  readonly exportClick = output<void>();

  onLocaleChange(event: Event): void {
    this.i18n.setLocale((event.target as HTMLSelectElement).value as Locale);
  }
}
