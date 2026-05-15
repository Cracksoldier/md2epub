import { Injectable, signal } from '@angular/core';
import { Toast, ToastAction, ToastType } from '../models/toast.model';

let nextToastId = 0;

export interface ToastOptions {
  action?: ToastAction;
  persistent?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: ToastType = 'info', opts: ToastOptions = {}): void {
    const id = String(nextToastId++);
    this._toasts.update(ts => [...ts, { id, message, type, action: opts.action, persistent: opts.persistent }]);
    if (!opts.persistent) setTimeout(() => this.dismiss(id), 3500);
  }

  dismiss(id: string): void {
    this._toasts.update(ts => ts.filter(t => t.id !== id));
  }
}
