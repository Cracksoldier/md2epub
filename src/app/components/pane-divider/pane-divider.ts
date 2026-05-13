import { Component, ElementRef, HostListener, OnDestroy, output } from '@angular/core';

const PANE_RATIO_KEY = 'pane-ratio';
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;
const KEYBOARD_STEP = 0.02;

@Component({
  selector: 'app-pane-divider',
  imports: [],
  template: `<div class="pane-divider" (mousedown)="onMouseDown($event)" (touchstart)="onTouchStart($event)" role="separator" aria-orientation="vertical" tabindex="0"></div>`,
  styleUrl: './pane-divider.scss',
})
export class PaneDivider implements OnDestroy {
  readonly ratioChange = output<number>();

  private dragging = false;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onTouchEnd.bind(this);

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    const current = PaneDivider.loadSavedRatio();
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.emitAndSave(current - KEYBOARD_STEP); }
    if (e.key === 'ArrowRight') { e.preventDefault(); this.emitAndSave(current + KEYBOARD_STEP); }
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.dragging = true;
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.dragging = true;
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    this.emitRatioFromX(event.clientX);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.dragging) return;
    event.preventDefault();
    this.emitRatioFromX(event.touches[0].clientX);
  }

  private onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  private onTouchEnd(): void {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  private emitRatioFromX(clientX: number): void {
    const workspace = this.el.nativeElement.closest('.workspace') as HTMLElement;
    if (!workspace) return;
    const rect = workspace.getBoundingClientRect();
    this.emitAndSave((clientX - rect.left) / rect.width);
  }

  private emitAndSave(raw: number): void {
    const ratio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, raw));
    this.ratioChange.emit(ratio);
    PaneDivider.saveRatio(ratio);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
  }

  static loadSavedRatio(): number {
    const saved = localStorage.getItem(PANE_RATIO_KEY);
    const parsed = saved ? parseFloat(saved) : NaN;
    return isNaN(parsed) ? 0.5 : Math.min(MAX_RATIO, Math.max(MIN_RATIO, parsed));
  }

  static saveRatio(ratio: number): void {
    localStorage.setItem(PANE_RATIO_KEY, String(ratio));
  }
}
