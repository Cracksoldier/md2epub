import { Component, ElementRef, OnDestroy, output } from '@angular/core';

const PANE_RATIO_KEY = 'pane-ratio';
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

@Component({
  selector: 'app-pane-divider',
  imports: [],
  template: `<div class="pane-divider" (mousedown)="onMouseDown($event)" role="separator" aria-orientation="vertical" tabindex="0"></div>`,
  styleUrl: './pane-divider.scss',
})
export class PaneDivider implements OnDestroy {
  readonly ratioChange = output<number>();

  private dragging = false;
  private boundMouseMove = this.onMouseMove.bind(this);
  private boundMouseUp = this.onMouseUp.bind(this);

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.dragging = true;
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;
    const workspace = this.el.nativeElement.closest('.workspace') as HTMLElement;
    if (!workspace) return;
    const rect = workspace.getBoundingClientRect();
    const ratio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, (event.clientX - rect.left) / rect.width));
    this.ratioChange.emit(ratio);
  }

  private onMouseUp(): void {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
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
