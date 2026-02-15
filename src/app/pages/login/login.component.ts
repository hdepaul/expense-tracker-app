import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="login-container">
      <div class="login-header">
        <div class="login-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
        <h2>{{ 'auth.login' | translate }}</h2>
        <p class="login-subtitle">{{ 'auth.loginSubtitle' | translate }}</p>
      </div>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">{{ 'auth.email' | translate }}</label>
          <input
            type="email"
            id="email"
            [(ngModel)]="email"
            name="email"
            required>
        </div>

        <div class="form-group">
          <label for="password">{{ 'auth.password' | translate }}</label>
          <div class="password-wrapper">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              id="password"
              [(ngModel)]="password"
              name="password"
              required>
            <button type="button" class="btn-eye" (click)="showPassword.set(!showPassword())">
              @if (showPassword()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>

        <button type="submit" [disabled]="loading()">
          {{ loading() ? ('auth.loggingIn' | translate) : ('auth.login' | translate) }}
        </button>
      </form>

      <p>{{ 'auth.noAccount' | translate }} <a routerLink="/register">{{ 'auth.register' | translate }}</a></p>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 420px;
      margin: 50px auto;
      padding: 20px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .login-icon {
      display: none;
    }
    h2 {
      color: var(--text-heading);
      margin-bottom: 8px;
    }
    .login-subtitle {
      color: var(--text-secondary);
      font-size: 0.95em;
      margin: 0;
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 18px;
    }
    label {
      display: block;
      margin-bottom: 6px;
      color: var(--text-primary);
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      box-sizing: border-box;
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 1em;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .password-wrapper {
      position: relative;
    }
    .password-wrapper input {
      padding-right: 44px;
    }
    .btn-eye {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      width: auto;
      border-radius: 4px;
    }
    .btn-eye:hover {
      color: var(--text-primary);
    }
    button[type="submit"] {
      width: 100%;
      padding: 14px;
      background: var(--accent);
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      font-size: 1em;
      font-weight: 600;
      margin-top: 8px;
      transition: background 0.2s;
    }
    button[type="submit"]:hover:not(:disabled) {
      background: var(--accent-hover);
    }
    button[type="submit"]:disabled {
      background: var(--border-color);
    }
    .error {
      background: var(--error-bg);
      color: var(--error-text);
      padding: 12px;
      margin-bottom: 18px;
      border-radius: 8px;
      font-size: 0.95em;
    }
    p {
      text-align: center;
      margin-top: 24px;
      color: var(--text-secondary);
      font-size: 0.95em;
    }
    p a {
      color: var(--accent);
      font-weight: 500;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .login-container {
        margin: 24px 16px;
        padding: 28px 20px;
        background: var(--bg-card);
        border-radius: 16px;
        box-shadow: 0 2px 12px var(--shadow-md);
      }
      .login-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        background: var(--accent-bg);
        border-radius: 50%;
        color: var(--accent);
        margin-bottom: 16px;
      }
      h2 {
        text-align: center;
        font-size: 1.5em;
        margin-bottom: 8px;
      }
      .login-subtitle {
        font-size: 0.9em;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        font-size: 0.95em;
        margin-bottom: 8px;
      }
      input {
        padding: 14px 16px;
        font-size: 16px;
        border-radius: 10px;
      }
      button[type="submit"] {
        padding: 16px;
        font-size: 1.05em;
        border-radius: 10px;
        margin-top: 12px;
      }
      p {
        margin-top: 28px;
        font-size: 1em;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = localStorage.getItem('lastEmail') || '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          localStorage.setItem('lastEmail', this.email);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        }
      });
  }
}
