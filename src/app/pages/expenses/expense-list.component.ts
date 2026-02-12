import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense, CategorySummary } from '../../models/expense.model';
import { ConfirmModalComponent } from '../../components/confirm-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, FormsModule, TranslateModule, ConfirmModalComponent],
  template: `
    <div class="expenses-container">
      <div class="header">
        <h2>{{ 'expenses.title' | translate }}</h2>
        <div class="header-actions">
          <select [(ngModel)]="selectedMonth" (change)="onMonthChange()" class="month-filter">
            <option value="">{{ 'expenses.allTime' | translate }}</option>
            @for (month of availableMonths; track month.value) {
              <option [value]="month.value">{{ month.label }}</option>
            }
          </select>
          <a routerLink="/expenses/new" class="btn-add">+ {{ 'nav.new' | translate }}</a>
        </div>
      </div>

      @if (loading()) {
        <p>{{ 'expenses.loading' | translate }}</p>
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      @if (!loading() && expenses().length === 0) {
        <p class="empty">{{ 'expenses.noExpenses' | translate }}</p>
      }

      @if (!loading() && expenses().length > 0) {
        <div class="summary">
          <div class="total-card">
            <span class="total-label">{{ 'expenses.total' | translate }}</span>
            <span class="total-amount">{{ totalAmount() | currency:'USD' }}</span>
          </div>
          <div class="category-breakdown">
            @for (cat of byCategory(); track cat.categoryName) {
              <div class="category-item">
                <span class="category-name">{{ 'categories.' + cat.categoryName | translate }}</span>
                <span class="category-amount">{{ cat.amount | currency:'USD' }}</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="expense-list">
        @for (expense of expenses(); track expense.id) {
          <div class="expense-card">
            <div class="expense-info">
              <h3>{{ expense.description }}</h3>
              <p class="date">{{ expense.date | date:'mediumDate' }}</p>
              @if (expense.notes) {
                <p class="notes">{{ expense.notes }}</p>
              }
            </div>
            <div class="expense-amount">
              {{ expense.amount | currency:'USD' }}
            </div>
            <div class="expense-actions">
              <a [routerLink]="['/expenses', expense.id, 'edit']" [queryParams]="{page: currentPage()}" class="btn-edit">{{ 'expenses.edit_btn' | translate }}</a>
              <button (click)="delete(expense)" class="btn-delete">{{ 'expenses.delete' | translate }}</button>
            </div>
          </div>
        }
      </div>

      @if (totalPages() > 1) {
        <div class="pagination">
          <button
            (click)="previousPage()"
            [disabled]="!hasPreviousPage()"
            class="btn-page">
            {{ 'expenses.previous' | translate }}
          </button>
          <span class="page-info">
            {{ 'expenses.page' | translate }} {{ currentPage() }} {{ 'expenses.of' | translate }} {{ totalPages() }} ({{ totalCount() }} {{ 'expenses.items' | translate }})
          </span>
          <button
            (click)="nextPage()"
            [disabled]="!hasNextPage()"
            class="btn-page">
            {{ 'expenses.next' | translate }}
          </button>
        </div>
      }

      @if (showDeleteModal()) {
        <app-confirm-modal
          [title]="'deleteModal.title' | translate"
          [message]="deleteMessage()"
          [confirmText]="'deleteModal.confirm' | translate"
          [cancelText]="'deleteModal.cancel' | translate"
          (confirmed)="confirmDelete()"
          (cancelled)="cancelDelete()"
        />
      }
    </div>
  `,
  styles: [`
    .expenses-container {
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .month-filter {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .btn-add {
      background: #28a745;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
    }
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .expense-card {
      display: flex;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
    }
    .expense-info {
      flex: 1;
    }
    .expense-info h3 {
      margin: 0 0 5px 0;
    }
    .date {
      color: #666;
      font-size: 0.9em;
      margin: 0;
    }
    .notes {
      color: #888;
      font-size: 0.85em;
      margin: 5px 0 0 0;
    }
    .expense-amount {
      font-size: 1.3em;
      font-weight: bold;
      color: #dc3545;
      margin-right: 20px;
    }
    .expense-actions {
      display: flex;
      gap: 10px;
    }
    .btn-edit {
      background: #007bff;
      color: white;
      padding: 5px 15px;
      text-decoration: none;
      border-radius: 4px;
    }
    .btn-delete {
      background: #dc3545;
      color: white;
      padding: 5px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: #dc3545;
      background: #f8d7da;
      padding: 10px;
      border-radius: 4px;
    }
    .empty {
      text-align: center;
      color: #666;
      padding: 40px;
    }
    .summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .total-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 2px solid #dee2e6;
      margin-bottom: 15px;
    }
    .total-label {
      font-size: 1.2em;
      font-weight: 600;
      color: #333;
    }
    .total-amount {
      font-size: 1.5em;
      font-weight: bold;
      color: #dc3545;
    }
    .category-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
    }
    .category-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: white;
      border-radius: 4px;
      border-left: 3px solid #007bff;
    }
    .category-name {
      color: #666;
    }
    .category-amount {
      font-weight: 600;
      color: #333;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .btn-page {
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-page:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .btn-page:not(:disabled):hover {
      background: #0056b3;
    }
    .page-info {
      color: #666;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .expenses-container {
        margin: 15px auto;
        padding: 10px;
      }
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }
      .header h2 {
        margin: 0;
        text-align: center;
      }
      .header-actions {
        flex-direction: column;
      }
      .month-filter {
        width: 100%;
      }
      .btn-add {
        text-align: center;
      }
      .expense-card {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .expense-info h3 {
        font-size: 1em;
      }
      .expense-amount {
        margin-right: 0;
        font-size: 1.2em;
      }
      .expense-actions {
        justify-content: stretch;
      }
      .btn-edit, .btn-delete {
        flex: 1;
        text-align: center;
      }
      .summary {
        padding: 15px;
      }
      .total-card {
        flex-direction: column;
        gap: 5px;
        text-align: center;
      }
      .category-breakdown {
        grid-template-columns: 1fr;
      }
      .pagination {
        flex-direction: column;
        gap: 10px;
      }
      .page-info {
        order: -1;
        font-size: 0.9em;
      }
      .btn-page {
        width: 100%;
      }
    }
  `]
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  expenses = signal<Expense[]>([]);
  loading = signal(true);
  error = signal('');
  showDeleteModal = signal(false);
  expenseToDelete = signal<Expense | null>(null);
  deleteMessage = computed(() => {
    const name = this.expenseToDelete()?.description || '';
    return this.translate.instant('deleteModal.message', { name });
  });

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  // Summary from backend (totals across ALL expenses, not just current page)
  totalAmount = signal(0);
  byCategory = signal<CategorySummary[]>([]);

  // Month filter
  selectedMonth = '';
  availableMonths = this.generateMonths();

  ngOnInit(): void {
    const page = this.route.snapshot.queryParamMap.get('page');
    if (page) {
      this.currentPage.set(parseInt(page, 10));
    }
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.loading.set(true);

    let fromDate: string | undefined;
    let toDate: string | undefined;

    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
      fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    }

    this.expenseService.getExpenses(this.currentPage(), this.pageSize(), fromDate, toDate).subscribe({
      next: (result) => {
        this.expenses.set(result.items);
        this.totalCount.set(result.totalCount);
        this.totalPages.set(result.totalPages);
        this.hasPreviousPage.set(result.hasPreviousPage);
        this.hasNextPage.set(result.hasNextPage);
        this.totalAmount.set(result.totalAmount);
        this.byCategory.set(result.byCategory);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('errors.loadExpenses'));
        this.loading.set(false);
      }
    });
  }

  onMonthChange(): void {
    this.currentPage.set(1);
    this.loadExpenses();
  }

  private generateMonths(): { value: string; label: string }[] {
    const months = [];
    const now = new Date();
    const lang = this.translate.currentLang || 'en';
    const locale = lang === 'es' ? 'es-AR' : 'en-US';
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return months;
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadExpenses();
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update(p => p - 1);
      this.loadExpenses();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update(p => p + 1);
      this.loadExpenses();
    }
  }

  delete(expense: Expense): void {
    this.expenseToDelete.set(expense);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const expense = this.expenseToDelete();
    if (!expense) return;

    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.closeModal();
        // Reload to update pagination correctly
        this.loadExpenses();
      },
      error: () => {
        this.error.set(this.translate.instant('errors.deleteExpense'));
        this.closeModal();
      }
    });
  }

  cancelDelete(): void {
    this.closeModal();
  }

  private closeModal(): void {
    this.showDeleteModal.set(false);
    this.expenseToDelete.set(null);
  }
}
