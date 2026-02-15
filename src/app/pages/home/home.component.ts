import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ExpenseService } from '../../services/expense.service';
import { BudgetService } from '../../services/budget.service';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategorySummary } from '../../models/expense.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule, CurrencyPipe],
  template: `
    @if (authService.isLoggedIn()) {
      <div class="dashboard">
        <h1 class="dash-greeting">{{ 'home.welcome' | translate }}, {{ authService.currentUser()?.firstName }}!</h1>

        <!-- Month summary card -->
        <div class="dash-card dash-summary">
          <div class="dash-card-header">
            <span>{{ 'home.thisMonth' | translate }}</span>
          </div>
          @if (loading()) {
            <div class="skeleton-block">
              <div class="skeleton-line skeleton-lg"></div>
              <div class="skeleton-line skeleton-sm"></div>
              <div class="skeleton-line skeleton-bar"></div>
              <div class="skeleton-line skeleton-md"></div>
              <div class="skeleton-line skeleton-md"></div>
              <div class="skeleton-line skeleton-md"></div>
            </div>
          } @else if (monthTotal() === 0) {
            <p class="dash-empty">{{ 'home.noExpensesThisMonth' | translate }}</p>
          } @else {
            <div class="dash-total">{{ monthTotal() | currency:'USD' }}</div>
            @if (comparisonText()) {
              <span class="dash-comparison" [class.up]="comparisonPercent() > 0" [class.down]="comparisonPercent() < 0" [class.same]="comparisonPercent() === 0">
                {{ comparisonText() }}
              </span>
            }

            <!-- Budget bar -->
            @if (budgetAmount() !== null) {
              <div class="dash-budget">
                <div class="dash-budget-label">
                  {{ monthTotal() | currency:'USD' }} {{ 'budget.of' | translate }} {{ budgetAmount() | currency:'USD' }} ({{ budgetPercent() }}%)
                </div>
                <div class="dash-budget-bar">
                  <div class="dash-budget-fill"
                    [style.width.%]="mathMin(budgetPercent(), 100)"
                    [class.green]="budgetPercent() < 60"
                    [class.yellow]="budgetPercent() >= 60 && budgetPercent() < 80"
                    [class.orange]="budgetPercent() >= 80 && budgetPercent() <= 100"
                    [class.red]="budgetPercent() > 100">
                  </div>
                </div>
              </div>
            }

            <!-- Top categories -->
            @if (topCategories().length > 0) {
              <div class="dash-categories">
                @for (cat of topCategories(); track cat.categoryName) {
                  <div class="dash-cat-row">
                    <span class="dash-cat-name">{{ 'categories.' + cat.categoryName | translate }}</span>
                    <span class="dash-cat-amount">{{ cat.amount | currency:'USD' }}</span>
                  </div>
                }
              </div>
            }
          }
        </div>

        <!-- Quick actions -->
        <div class="dash-actions">
          <a routerLink="/expenses" class="dash-action-card">
            <span class="dash-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </span>
            <span>{{ 'nav.myExpenses' | translate }}</span>
          </a>
          <a routerLink="/expenses" class="dash-action-card highlight">
            <span class="dash-action-icon chat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span>{{ 'home.addExpense' | translate }}</span>
          </a>
          <a routerLink="/reports" class="dash-action-card">
            <span class="dash-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </span>
            <span>{{ 'home.viewReports' | translate }}</span>
          </a>
        </div>
      </div>
    } @else {
      <div class="landing">
        <!-- Hero -->
        <section class="hero">
          <div class="hero-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
          <h1>{{ 'home.heroTitle' | translate }}</h1>
          <p class="hero-subtitle">{{ 'home.heroSubtitle' | translate }}</p>
          <div class="hero-actions">
            <a routerLink="/register" class="btn-primary btn-lg">{{ 'home.getStarted' | translate }}</a>
            <a routerLink="/login" class="btn-outline btn-lg">{{ 'nav.login' | translate }}</a>
          </div>
        </section>

        <!-- Features -->
        <section class="features">
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>{{ 'home.feature1Title' | translate }}</h3>
            <p>{{ 'home.feature1Desc' | translate }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
            </div>
            <h3>{{ 'home.feature2Title' | translate }}</h3>
            <p>{{ 'home.feature2Desc' | translate }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            </div>
            <h3>{{ 'home.feature3Title' | translate }}</h3>
            <p>{{ 'home.feature3Desc' | translate }}</p>
          </div>
        </section>

        <!-- How it works -->
        <section class="how-it-works">
          <h2>{{ 'home.howTitle' | translate }}</h2>
          <div class="steps">
            <div class="step">
              <span class="step-number">1</span>
              <p>{{ 'home.step1' | translate }}</p>
            </div>
            <div class="step-arrow">&#8594;</div>
            <div class="step">
              <span class="step-number">2</span>
              <p>{{ 'home.step2' | translate }}</p>
            </div>
            <div class="step-arrow">&#8594;</div>
            <div class="step">
              <span class="step-number">3</span>
              <p>{{ 'home.step3' | translate }}</p>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="cta">
          <h2>{{ 'home.ctaTitle' | translate }}</h2>
          <a routerLink="/register" class="btn-primary btn-lg">{{ 'home.getStarted' | translate }}</a>
          <div class="share-section">
            <p class="share-label">{{ 'home.shareCta' | translate }}</p>
            <div class="share-row">
              <div class="qr-container">
                <img [src]="qrUrl" alt="QR enquegasto.com" width="140" height="140" />
              </div>
              <button (click)="shareApp()" class="btn-outline btn-share-landing">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                {{ showCopied() ? ('home.copied' | translate) : ('home.share' | translate) }}
              </button>
            </div>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    /* Dashboard */
    .dashboard {
      max-width: 700px;
      margin: 30px auto;
      padding: 20px;
    }
    .dash-greeting {
      font-size: 1.6em;
      color: var(--text-heading);
      margin-bottom: 24px;
    }
    .dash-card {
      background: var(--bg-card-alt);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      border: 1px solid var(--border-light);
      transition: background 0.3s, border-color 0.3s;
    }
    .dash-card-header {
      font-size: 0.9em;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .dash-empty {
      color: var(--text-muted);
      font-size: 0.95em;
      text-align: center;
      padding: 20px 0;
    }
    .dash-total {
      font-size: 2.2em;
      font-weight: 700;
      color: var(--danger);
      margin-bottom: 8px;
    }
    .dash-comparison {
      display: inline-block;
      font-size: 0.9em;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .dash-comparison.up {
      background: var(--comparison-up-bg);
      color: var(--comparison-up-text);
    }
    .dash-comparison.down {
      background: var(--comparison-down-bg);
      color: var(--comparison-down-text);
    }
    .dash-comparison.same {
      background: var(--comparison-same-bg);
      color: var(--comparison-same-text);
    }
    .dash-budget {
      margin: 16px 0 12px;
    }
    .dash-budget-label {
      font-size: 1em;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    .dash-budget-bar {
      height: 10px;
      background: var(--budget-bar-bg);
      border-radius: 5px;
      overflow: hidden;
    }
    .dash-budget-fill {
      height: 100%;
      border-radius: 5px;
      transition: width 0.3s;
    }
    .dash-budget-fill.green { background: #22c55e; }
    .dash-budget-fill.yellow { background: #eab308; }
    .dash-budget-fill.orange { background: #f97316; }
    .dash-budget-fill.red { background: #ef4444; }
    .dash-categories {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .dash-cat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--bg-card);
      border-radius: 6px;
      border-left: 3px solid var(--accent);
      transition: background 0.3s;
    }
    .dash-cat-name {
      color: var(--text-secondary);
      font-size: 0.95em;
    }
    .dash-cat-amount {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95em;
    }
    .dash-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .dash-action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 24px 16px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9em;
      transition: all 0.2s;
      cursor: pointer;
    }
    .dash-action-card:hover {
      border-color: var(--accent);
      color: var(--accent);
      box-shadow: 0 2px 8px var(--shadow-md);
    }
    .dash-action-card.highlight {
      border-color: var(--accent);
      background: var(--accent-bg-alt);
    }
    .dash-action-card.highlight:hover {
      background: var(--accent);
      color: white;
    }
    .dash-action-card.highlight:hover .chat-icon {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .dash-action-icon {
      width: 48px;
      height: 48px;
      background: var(--accent-bg);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
    }

    /* Skeleton loading */
    .skeleton-block {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }
    .skeleton-line {
      border-radius: 4px;
      background: linear-gradient(90deg, var(--border-light) 25%, var(--bg-card) 50%, var(--border-light) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-lg {
      height: 36px;
      width: 60%;
    }
    .skeleton-sm {
      height: 20px;
      width: 40%;
    }
    .skeleton-md {
      height: 24px;
      width: 80%;
    }
    .skeleton-bar {
      height: 10px;
      width: 100%;
      margin: 4px 0;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Buttons */
    .btn-primary {
      display: inline-block;
      padding: 12px 28px;
      background: var(--accent);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95em;
      border: 2px solid var(--accent);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }
    .btn-outline {
      display: inline-block;
      padding: 12px 28px;
      background: transparent;
      color: var(--accent);
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95em;
      border: 2px solid var(--accent);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline:hover {
      background: var(--accent);
      color: white;
    }
    .btn-lg {
      padding: 14px 36px;
      font-size: 1.05em;
    }

    /* Landing */
    .landing {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero */
    .hero {
      text-align: center;
      padding: 80px 0 60px;
    }
    .hero-icon {
      width: 100px;
      height: 100px;
      background: var(--accent-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: var(--accent);
    }
    .hero h1 {
      font-size: 2.5em;
      color: var(--text-heading);
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .hero-subtitle {
      font-size: 1.2em;
      color: var(--text-secondary);
      max-width: 500px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    /* Features */
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      padding: 40px 0 60px;
    }
    .feature-card {
      text-align: center;
      padding: 32px 20px;
      background: var(--bg-card-alt);
      border-radius: 12px;
      border: 1px solid var(--border-light);
      transition: background 0.3s, border-color 0.3s;
    }
    .feature-icon {
      width: 60px;
      height: 60px;
      background: var(--accent-bg);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: var(--accent);
    }
    .feature-card h3 {
      font-size: 1.1em;
      margin-bottom: 8px;
      color: var(--text-heading);
    }
    .feature-card p {
      color: var(--text-secondary);
      font-size: 0.9em;
      line-height: 1.5;
    }

    /* How it works */
    .how-it-works {
      text-align: center;
      padding: 40px 0 60px;
    }
    .how-it-works h2 {
      font-size: 1.8em;
      margin-bottom: 32px;
      color: var(--text-heading);
    }
    .steps {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    .step {
      text-align: center;
      flex: 1;
      max-width: 200px;
    }
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: var(--accent);
      color: white;
      border-radius: 50%;
      font-size: 1.2em;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .step p {
      color: var(--text-secondary);
      font-size: 0.95em;
      line-height: 1.4;
    }
    .step-arrow {
      color: var(--border-color);
      font-size: 1.5em;
      margin-top: -20px;
    }

    /* CTA */
    .cta {
      text-align: center;
      padding: 48px 32px;
      background: var(--accent-bg-alt);
      border-radius: 16px;
      margin-bottom: 60px;
      border: 1px solid var(--border-light);
      transition: background 0.3s, border-color 0.3s;
    }
    .cta h2 {
      font-size: 1.6em;
      color: var(--text-heading);
      margin-bottom: 20px;
    }
    .share-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }
    .share-label {
      color: var(--text-secondary);
      font-size: 0.95em;
      margin-bottom: 16px;
    }
    .share-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }
    .qr-container {
      background: var(--bg-card);
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow);
    }
    .qr-container img {
      display: block;
      border-radius: 4px;
    }
    .btn-share-landing {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .dashboard {
        margin: 15px auto;
        padding: 10px;
      }
      .dash-greeting {
        font-size: 1.3em;
        text-align: center;
      }
      .dash-total {
        font-size: 1.8em;
      }
      .dash-actions {
        grid-template-columns: 1fr;
      }
      .dash-action-card {
        flex-direction: row;
        padding: 16px;
      }
      .dash-action-icon {
        width: 40px;
        height: 40px;
      }
      .hero {
        padding: 50px 0 40px;
      }
      .hero h1 {
        font-size: 1.8em;
      }
      .hero-subtitle {
        font-size: 1em;
      }
      .hero-actions {
        flex-direction: column;
        align-items: center;
      }
      .btn-lg {
        width: 100%;
        text-align: center;
      }
      .features {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 20px 0 40px;
      }
      .steps {
        flex-direction: column;
        gap: 8px;
      }
      .step-arrow {
        transform: rotate(90deg);
        margin: 0;
      }
      .how-it-works h2 {
        font-size: 1.4em;
      }
      .cta {
        padding: 32px 20px;
        margin-bottom: 40px;
      }
      .cta h2 {
        font-size: 1.3em;
      }
      .share-row {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private expenseService = inject(ExpenseService);
  private budgetService = inject(BudgetService);

  showCopied = signal(false);
  qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https://enquegasto.com';

  // Dashboard data
  loading = signal(false);
  monthTotal = signal(0);
  topCategories = signal<CategorySummary[]>([]);
  budgetAmount = signal<number | null>(null);
  comparisonPercent = signal(0);
  comparisonText = signal('');

  budgetPercent(): number {
    const budget = this.budgetAmount();
    if (!budget || budget === 0) return 0;
    return Math.round((this.monthTotal() / budget) * 100);
  }

  mathMin(a: number, b: number): number { return Math.min(a, b); }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadDashboard();
    }
  }

  private loadDashboard(): void {
    this.loading.set(true);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Load current month
    this.expenseService.getExpenses(1, 1, fromDate, toDate).subscribe({
      next: (result) => {
        this.monthTotal.set(result.totalAmount);
        this.topCategories.set(result.byCategory.slice(0, 5));
        this.loading.set(false);

        // Load previous month for comparison
        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth < 1) { prevMonth = 12; prevYear--; }
        const prevFrom = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
        const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
        const prevTo = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${prevLastDay}`;

        this.expenseService.getExpenses(1, 1, prevFrom, prevTo).subscribe({
          next: (prevResult) => {
            const prevTotal = prevResult.totalAmount;
            if (prevTotal === 0) {
              this.comparisonText.set(this.translate.instant('comparison.noData'));
              return;
            }
            const diff = ((result.totalAmount - prevTotal) / prevTotal) * 100;
            const pct = Math.abs(Math.round(diff));
            this.comparisonPercent.set(diff);
            if (diff > 0) {
              this.comparisonText.set(this.translate.instant('comparison.more', { percent: pct }));
            } else if (diff < 0) {
              this.comparisonText.set(this.translate.instant('comparison.less', { percent: pct }));
            } else {
              this.comparisonText.set(this.translate.instant('comparison.same'));
            }
          }
        });
      },
      error: () => this.loading.set(false)
    });

    // Load budget
    this.budgetService.getBudget().subscribe({
      next: (budget) => this.budgetAmount.set(budget?.amount ?? null)
    });
  }

  async shareApp(): Promise<void> {
    const url = 'https://enquegasto.com';
    const text = this.translate.instant('home.shareText');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'EnQueGasto', text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      this.showCopied.set(true);
      setTimeout(() => this.showCopied.set(false), 2000);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
