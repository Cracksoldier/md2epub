import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models/toast.model';

let nextToastId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info'): void {
    const id = String(nextToastId++);
    this._toasts.update(ts => [...ts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 3500);
  }

  dismiss(id: string): void {
    this._toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
