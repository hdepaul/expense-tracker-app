import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { CategorySummary } from '../../models/expense.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyPipe, BaseChartDirective, TranslateModule],
  template: `
    <div class="reports-container">
      <div class="header">
        <h2>{{ 'reports.title' | translate }}</h2>
        <div class="month-nav">
          <button class="btn-month-arrow" (click)="prevMonth()" [title]="'expenses.previous' | translate">&#8249;</button>
          <button class="btn-month-label" (click)="toggleAllTime()">
            {{ currentMonthLabel() }}
          </button>
          <button class="btn-month-arrow" (click)="nextMonth()" [disabled]="!canGoNextMonth()" [title]="'expenses.next' | translate">&#8250;</button>
        </div>
      </div>

      @if (loading()) {
        <p>{{ 'expenses.loading' | translate }}</p>
      }

      @if (!loading() && byCategory().length === 0) {
        <p class="empty">{{ 'reports.noData' | translate }}</p>
      }

      @if (!loading() && byCategory().length > 0) {
        <div class="chart-section">
          <div class="chart-container">
            <canvas baseChart
              [data]="pieChartData"
              [options]="pieChartOptions"
              type="pie">
            </canvas>
          </div>

          <div class="summary-section">
            <div class="total-card">
              <span class="total-label">{{ 'expenses.total' | translate }}</span>
              <span class="total-amount">{{ totalAmount() | currency:'USD' }}</span>
            </div>

            <div class="category-list">
              @for (cat of byCategory(); track cat.categoryName) {
                <div class="category-row">
                  <span class="color-dot" [style.background]="getCategoryColor(cat.categoryName)"></span>
                  <span class="cat-name">{{ 'categories.' + cat.categoryName | translate }}</span>
                  <span class="cat-amount">{{ cat.amount | currency:'USD' }}</span>
                  <span class="cat-percent">{{ getPercentage(cat.amount) }}%</span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-container {
      max-width: 900px;
      margin: 30px auto;
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    .month-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-month-arrow {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #ddd;
      background: white;
      font-size: 1.3em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
      transition: all 0.2s;
    }
    .btn-month-arrow:hover:not(:disabled) {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    .btn-month-arrow:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .btn-month-label {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 20px;
      background: white;
      font-size: 0.9em;
      font-weight: 500;
      cursor: pointer;
      color: #333;
      min-width: 140px;
      text-align: center;
      transition: all 0.2s;
    }
    .btn-month-label:hover {
      border-color: #007bff;
      color: #007bff;
    }
    .chart-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      align-items: start;
    }
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .summary-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    .total-card {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: white;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .total-label {
      font-size: 1.1em;
      font-weight: 600;
    }
    .total-amount {
      font-size: 1.3em;
      font-weight: bold;
      color: #dc3545;
    }
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .category-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .cat-name {
      flex: 1;
      color: #333;
    }
    .cat-amount {
      font-weight: 600;
      color: #333;
    }
    .cat-percent {
      color: #666;
      font-size: 0.9em;
      min-width: 45px;
      text-align: right;
    }
    .empty {
      text-align: center;
      color: #666;
      padding: 60px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    @media (max-width: 768px) {
      .reports-container {
        margin: 15px auto;
        padding: 10px;
      }
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
      .header h2 {
        margin: 0;
        text-align: center;
      }
      .month-nav {
        justify-content: center;
      }
      .chart-section {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      .chart-container {
        padding: 15px;
      }
      .summary-section {
        padding: 15px;
      }
      .total-card {
        flex-direction: column;
        gap: 5px;
        text-align: center;
        padding: 12px;
      }
      .category-row {
        padding: 8px;
        gap: 8px;
      }
      .cat-name {
        font-size: 0.9em;
      }
      .cat-amount {
        font-size: 0.9em;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private expenseService = inject(ExpenseService);
  private translate = inject(TranslateService);

  loading = signal(true);
  totalAmount = signal(0);
  byCategory = signal<CategorySummary[]>([]);

  private filterYear = new Date().getFullYear();
  private filterMonth = new Date().getMonth();
  private showAllTime = false;

  private categoryColors: Record<string, string> = {
    'Restaurants': '#FF6384',
    'Transportation': '#36A2EB',
    'Housing': '#FFCE56',
    'Entertainment': '#4BC0C0',
    'Shopping': '#9966FF',
    'Healthcare': '#FF9F40',
    'Utilities': '#C9CBCF',
    'Taxes': '#7C4DFF',
    'Services': '#00BCD4',
    'Subscriptions': '#E91E63',
    'Credit Card': '#8BC34A',
    'Nafta': '#FF5722',
    'Groceries': '#795548',
    'Other': '#607D8B'
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: []
    }]
  };

  ngOnInit(): void {
    this.loadData();

    // Update chart when language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateChartLabels();
    });
  }

  loadData(): void {
    this.loading.set(true);

    let fromDate: string | undefined;
    let toDate: string | undefined;

    if (!this.showAllTime) {
      const year = this.filterYear;
      const month = this.filterMonth + 1;
      fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    }

    this.expenseService.getExpenses(1, 1000, fromDate, toDate).subscribe({
      next: (result) => {
        this.totalAmount.set(result.totalAmount);
        this.byCategory.set(result.byCategory);
        this.updateChart();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private updateChart(): void {
    const categories = this.byCategory();

    this.pieChartData = {
      labels: categories.map(c => this.translate.instant('categories.' + c.categoryName)),
      datasets: [{
        data: categories.map(c => c.amount),
        backgroundColor: categories.map(c => this.getCategoryColor(c.categoryName))
      }]
    };

    this.chart?.update();
  }

  private updateChartLabels(): void {
    const categories = this.byCategory();
    this.pieChartData.labels = categories.map(c => this.translate.instant('categories.' + c.categoryName));
    this.chart?.update();
  }

  currentMonthLabel(): string {
    if (this.showAllTime) {
      return this.translate.instant('expenses.allTime');
    }
    const lang = this.translate.currentLang || 'en';
    const locale = lang === 'es' ? 'es-AR' : 'en-US';
    const date = new Date(this.filterYear, this.filterMonth, 1);
    const label = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  canGoNextMonth(): boolean {
    const now = new Date();
    return this.showAllTime || this.filterYear < now.getFullYear() ||
      (this.filterYear === now.getFullYear() && this.filterMonth < now.getMonth());
  }

  prevMonth(): void {
    if (this.showAllTime) {
      this.showAllTime = false;
    } else {
      this.filterMonth--;
      if (this.filterMonth < 0) {
        this.filterMonth = 11;
        this.filterYear--;
      }
    }
    this.loadData();
  }

  nextMonth(): void {
    if (!this.canGoNextMonth()) return;
    this.filterMonth++;
    if (this.filterMonth > 11) {
      this.filterMonth = 0;
      this.filterYear++;
    }
    this.loadData();
  }

  toggleAllTime(): void {
    this.showAllTime = !this.showAllTime;
    if (!this.showAllTime) {
      const now = new Date();
      this.filterYear = now.getFullYear();
      this.filterMonth = now.getMonth();
    }
    this.loadData();
  }

  getCategoryColor(categoryName: string): string {
    return this.categoryColors[categoryName] || '#999999';
  }

  getPercentage(amount: number): string {
    const total = this.totalAmount();
    if (total === 0) return '0';
    return ((amount / total) * 100).toFixed(1);
  }
}
