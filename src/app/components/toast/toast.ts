import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { I18nService } from '../../services/i18n.service';
import { Toast as ToastModel } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  protected readonly toastService = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  invokeAction(toast: ToastModel): void {
    toast.action?.onClick();
    this.toastService.dismiss(toast.id);
  }
}
