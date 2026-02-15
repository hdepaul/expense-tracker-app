import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>{{ title() }}</h3>
        <p>{{ message() }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" (click)="onCancel()">{{ cancelText() }}</button>
          <button class="btn-confirm" (click)="onConfirm()">{{ confirmText() }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--modal-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: var(--bg-card);
      padding: 25px;
      border-radius: 8px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 20px var(--shadow-md);
      transition: background 0.3s;
    }
    .modal h3 {
      margin: 0 0 15px 0;
      color: var(--text-heading);
    }
    .modal p {
      margin: 0 0 20px 0;
      color: var(--text-secondary);
    }
    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn-cancel {
      padding: 10px 20px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-confirm {
      padding: 10px 20px;
      background: var(--danger);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-cancel:hover {
      background: #5a6268;
    }
    .btn-confirm:hover {
      background: var(--danger-hover);
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .modal {
        margin: 15px;
        min-width: auto;
        max-width: calc(100% - 30px);
        padding: 20px;
      }
      .modal-actions {
        flex-direction: column-reverse;
      }
      .btn-cancel, .btn-confirm {
        padding: 14px 20px;
        font-size: 1em;
      }
    }
  `]
})
export class ConfirmModalComponent {
  title = input('Confirm');
  message = input('Are you sure?');
  confirmText = input('Delete');
  cancelText = input('Cancel');

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
