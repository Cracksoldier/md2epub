import { AfterViewInit, Component, ElementRef, HostListener, inject, output, ViewChild } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

const FOCUSABLE = 'button, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'app-shortcuts-modal',
  imports: [],
  templateUrl: './shortcuts-modal.html',
  styleUrl: './shortcuts-modal.scss',
})
export class ShortcutsModal implements AfterViewInit {
  protected readonly i18n = inject(I18nService);
  private readonly el = inject(ElementRef<HTMLElement>);
  @ViewChild('card') cardRef!: ElementRef<HTMLElement>;

  readonly close = output<void>();

  readonly isMac = navigator.platform.startsWith('Mac') || navigator.userAgent.includes('Mac');
  get mod(): string { return this.isMac ? '⌘' : 'Ctrl'; }

  ngAfterViewInit(): void {
    this.cardRef.nativeElement.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(this.cardRef.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
}
