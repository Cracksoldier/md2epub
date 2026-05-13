import { AfterViewInit, Component, ElementRef, HostListener, inject, output, ViewChild } from '@angular/core';
import { I18nService } from '../../services/i18n.service';
import type { Locale } from '../../i18n/translations';

const FOCUSABLE = 'button, select, input, a[href], [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-welcome-modal',
  imports: [],
  templateUrl: './welcome-modal.html',
  styleUrl: './welcome-modal.scss',
})
export class WelcomeModal implements AfterViewInit {
  protected readonly i18n = inject(I18nService);
  private readonly el = inject(ElementRef<HTMLElement>);

  @ViewChild('card') cardRef!: ElementRef<HTMLElement>;

  readonly close = output<void>();

  ngAfterViewInit(): void {
    const first = this.cardRef.nativeElement.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const card = this.cardRef.nativeElement;
    const focusable = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  onLocaleChange(event: Event): void {
    this.i18n.setLocale((event.target as HTMLSelectElement).value as Locale);
  }
}
