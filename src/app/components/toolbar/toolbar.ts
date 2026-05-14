import { Component, computed, ElementRef, HostListener, inject, input, output, signal, ViewChildren, QueryList } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import type { Locale } from '../../i18n/translations';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-toolbar',
  imports: [FlagIcon],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class Toolbar {
  protected readonly i18n = inject(I18nService);
  private readonly el = inject(ElementRef);

  readonly exportLoading = input(false);

  readonly importClick = output<void>();
  readonly saveProjectClick = output<void>();
  readonly loadProjectClick = output<void>();
  readonly settingsClick = output<void>();
  readonly previewClick = output<void>();
  readonly exportClick = output<void>();

  readonly localeOpen = signal(false);

  readonly currentLocaleLabel = computed(
    () => this.i18n.locales.find(l => l.code === this.i18n.locale())?.label ?? this.i18n.locale()
  );

  @ViewChildren('localeOption') localeOptions!: QueryList<ElementRef<HTMLButtonElement>>;

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

  onDropdownKeydown(e: KeyboardEvent): void {
    if (!this.localeOpen()) return;
    const options = this.localeOptions.toArray();
    const focused = options.findIndex(o => o.nativeElement === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      options[(focused + 1) % options.length]?.nativeElement.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      options[(focused - 1 + options.length) % options.length]?.nativeElement.focus();
    } else if (e.key === 'Tab') {
      this.localeOpen.set(false);
    } else if (e.key === 'Home') {
      e.preventDefault();
      options[0]?.nativeElement.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      options[options.length - 1]?.nativeElement.focus();
    }
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
