import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../services/expense.service';
import { CategorySummary } from '../../models/expense.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, BaseChartDirective, TranslateModule],
  template: `
    <div class="reports-container">
      <div class="header">
        <h2>{{ 'reports.title' | translate }}</h2>
        <select [(ngModel)]="selectedMonth" (change)="onMonthChange()" class="month-filter">
          <option value="">{{ 'expenses.allTime' | translate }}</option>
          @for (month of availableMonths; track month.value) {
            <option [value]="month.value">{{ month.label }}</option>
          }
        </select>
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
    .month-filter {
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1em;
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
      .month-filter {
        width: 100%;
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

  selectedMonth = '';
  availableMonths = this.generateMonths();

  private categoryColors: Record<string, string> = {
    'Food & Dining': '#FF6384',
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
    'Comida': '#795548',
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

    if (this.selectedMonth) {
      const [year, month] = this.selectedMonth.split('-').map(Number);
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

  onMonthChange(): void {
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
}
