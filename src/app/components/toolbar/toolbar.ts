import { Component, computed, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';
import type { Locale } from '../../i18n/translations';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, FlagIcon],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  protected readonly i18n = inject(I18nService);
  private readonly el = inject(ElementRef);

  readonly exportLoading = input(false);

  readonly importClick = output<void>();
  readonly settingsClick = output<void>();
  readonly exportClick = output<void>();

  readonly localeOpen = signal(false);

  readonly currentLocaleLabel = computed(
    () => this.i18n.locales.find(l => l.code === this.i18n.locale())?.label ?? this.i18n.locale()
  );

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.localeOpen() && !this.el.nativeElement.contains(e.target as Node)) {
      this.localeOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.localeOpen.set(false);
  }

  toggleLocale(e: MouseEvent): void {
    e.stopPropagation();
    this.localeOpen.update(v => !v);
  }

  selectLocale(code: Locale): void {
    this.i18n.setLocale(code);
    this.localeOpen.set(false);
  }
}
