import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: Toast['type'] = 'info', options?: { action?: Toast['action']; duration?: number }): void {
    const id = crypto.randomUUID();
    const duration = options?.duration ?? (options?.action ? 5000 : 3000);
    this.toasts.update(t => [...t, { id, message, type, action: options?.action }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
