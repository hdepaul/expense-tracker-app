import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.type">
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)">&times;</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 90%;
      max-width: 420px;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease-out;
      pointer-events: auto;
    }
    .toast-success {
      background: var(--toast-success-bg);
      color: var(--toast-success-text);
      border-left-color: #22c55e;
    }
    .toast-error {
      background: var(--toast-error-bg);
      color: var(--toast-error-text);
      border-left-color: #ef4444;
    }
    .toast-info {
      background: var(--toast-info-bg);
      color: var(--toast-info-text);
      border-left-color: #3b82f6;
    }
    .toast-message {
      flex: 1;
      font-size: 0.95em;
      line-height: 1.4;
    }
    .toast-close {
      background: none;
      border: none;
      font-size: 1.3em;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      padding: 0 4px;
      line-height: 1;
    }
    .toast-close:hover {
      opacity: 1;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
