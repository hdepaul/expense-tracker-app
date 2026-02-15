import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AdminUser } from '../../services/admin.service';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [TranslateModule, DatePipe],
  template: `
    <div class="admin-container">
      <h2>{{ 'admin.title' | translate }}</h2>

      @if (loading()) {
        <p class="loading">{{ 'admin.loading' | translate }}</p>
      } @else if (users().length === 0) {
        <p class="no-data">{{ 'admin.noUsers' | translate }}</p>
      } @else {
        <p class="total">{{ 'admin.totalUsers' | translate }}: {{ users().length }}</p>

        <div class="user-grid">
          @for (user of users(); track user.userId) {
            <div class="user-card">
              <div class="user-info">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
                <span class="user-date">{{ 'admin.registered' | translate }}: {{ user.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="ai-usage" [class.at-limit]="user.todayMessageCount >= user.dailyMessageLimit">
                <span class="usage-label">{{ 'admin.aiMessages' | translate }}</span>
                <span class="usage-count">{{ user.todayMessageCount }}/{{ user.dailyMessageLimit }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 900px;
      margin: 30px auto;
      padding: 0 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: var(--text-heading);
    }
    .loading, .no-data {
      text-align: center;
      color: var(--text-muted);
      padding: 40px 0;
    }
    .total {
      color: var(--text-secondary);
      margin-bottom: 20px;
      font-size: 0.95em;
    }
    .user-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .user-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px 20px;
      transition: box-shadow 0.2s, background 0.3s;
    }
    .user-card:hover {
      box-shadow: 0 2px 8px var(--shadow);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .user-name {
      font-weight: 600;
      color: var(--text-primary);
    }
    .user-email {
      color: var(--text-secondary);
      font-size: 0.9em;
    }
    .user-date {
      color: var(--text-muted);
      font-size: 0.82em;
    }
    .ai-usage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: var(--ai-usage-bg);
      border-radius: 8px;
      min-width: 80px;
    }
    .usage-label {
      font-size: 0.75em;
      color: var(--text-secondary);
      text-transform: uppercase;
    }
    .usage-count {
      font-weight: 700;
      font-size: 1.1em;
      color: var(--comparison-down-text);
    }
    .ai-usage.at-limit {
      background: var(--ai-usage-limit-bg);
    }
    .ai-usage.at-limit .usage-count {
      color: var(--comparison-up-text);
    }

    @media (max-width: 600px) {
      .user-card {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      .ai-usage {
        flex-direction: row;
        justify-content: space-between;
      }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<AdminUser[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
