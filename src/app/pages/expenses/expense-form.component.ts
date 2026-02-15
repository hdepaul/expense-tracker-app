import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../services/toast.service';
import { Category } from '../../models/expense.model';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="form-container">
      <h2>{{ (isEdit() ? 'expenses.edit' : 'expenses.new') | translate }}</h2>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="description">{{ 'expenseForm.description' | translate }}</label>
          <input
            type="text"
            id="description"
            [(ngModel)]="description"
            name="description"
            required>
        </div>

        <div class="form-group">
          <label for="amount">{{ 'expenseForm.amount' | translate }}</label>
          <input
            type="number"
            id="amount"
            [(ngModel)]="amount"
            name="amount"
            step="0.01"
            min="0.01"
            required>
        </div>

        <div class="form-group">
          <label for="date">{{ 'expenseForm.date' | translate }}</label>
          <input
            type="date"
            id="date"
            [(ngModel)]="date"
            name="date"
            [max]="today"
            required>
        </div>

        <div class="form-group">
          <label for="category">{{ 'expenseForm.category' | translate }}</label>
          <select id="category" [(ngModel)]="categoryId" name="category" required>
            <option value="">{{ 'expenseForm.selectCategory' | translate }}</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ 'categories.' + cat.name | translate }}</option>
            }
          </select>
        </div>

        <div class="form-group">
          <label for="notes">{{ 'expenseForm.notes' | translate }}</label>
          <textarea
            id="notes"
            [(ngModel)]="notes"
            name="notes"
            rows="3">
          </textarea>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="loading()" class="btn-save">
            {{ loading() ? ('expenseForm.saving' | translate) : ('expenseForm.save' | translate) }}
          </button>
          <a [routerLink]="['/expenses']" [queryParams]="{page: returnPage}" class="btn-cancel">{{ 'expenseForm.cancel' | translate }}</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 500px;
      margin: 30px auto;
      padding: 20px;
    }
    h2 {
      color: var(--text-heading);
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: var(--text-primary);
    }
    input, select, textarea {
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: var(--input-bg);
      color: var(--text-primary);
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .btn-save {
      flex: 1;
      padding: 12px;
      background: var(--success);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-save:disabled {
      background: var(--border-color);
    }
    .btn-cancel {
      flex: 1;
      padding: 12px;
      background: #6c757d;
      color: white;
      text-decoration: none;
      text-align: center;
      border-radius: 4px;
    }
    .error {
      background: var(--error-bg);
      color: var(--error-text);
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .form-container {
        margin: 15px auto;
        padding: 15px;
      }
      h2 {
        font-size: 1.3em;
        text-align: center;
        margin-bottom: 20px;
      }
      .form-group {
        margin-bottom: 12px;
      }
      input, select, textarea {
        padding: 12px;
        font-size: 16px;
      }
      .form-actions {
        flex-direction: column;
      }
      .btn-save, .btn-cancel {
        padding: 14px;
        font-size: 1em;
      }
    }
  `]
})
export class ExpenseFormComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  isEdit = signal(false);
  expenseId = '';
  returnPage = 1;

  // Form fields
  description = '';
  amount: number | null = null;
  date = '';
  categoryId = '';
  notes = '';
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadCategories();

    // Get return page from query params
    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.returnPage = parseInt(page, 10);
    }

    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.expenseId = id;
      this.loadExpense(id);
    } else {
      // Default date to today
      this.date = new Date().toISOString().split('T')[0];
    }
  }

  loadCategories(): void {
    this.expenseService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.error.set(this.translate.instant('expenseForm.failedCategories'))
    });
  }

  loadExpense(id: string): void {
    this.expenseService.getExpense(id).subscribe({
      next: (expense) => {
        this.description = expense.description;
        this.amount = expense.amount;
        this.date = expense.date.split('T')[0];
        this.categoryId = expense.categoryId;
        this.notes = expense.notes || '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error.set(this.translate.instant('expenseForm.failedLoad'));
      }
    });
  }

  onSubmit(): void {
    if (!this.amount || !this.description || !this.date || !this.categoryId) {
      this.error.set(this.translate.instant('expenseForm.fillRequired'));
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const expenseData = {
      description: this.description,
      amount: this.amount,
      date: this.date,
      categoryId: this.categoryId,
      notes: this.notes || undefined
    };

    const request = this.isEdit()
      ? this.expenseService.updateExpense(this.expenseId, expenseData)
      : this.expenseService.createExpense(expenseData);

    request.subscribe({
      next: () => {
        this.toast.show(
          this.translate.instant(this.isEdit() ? 'toast.expenseUpdated' : 'toast.expenseCreated'),
          'success'
        );
        this.router.navigate(['/expenses'], {
          queryParams: { page: this.returnPage }
        });
      },
      error: (err) => {
        this.error.set(err.error?.message || this.translate.instant('expenseForm.failedSave'));
        this.loading.set(false);
      }
    });
  }
}
