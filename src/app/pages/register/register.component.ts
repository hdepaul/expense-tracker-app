import { Component, inject, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="register-container">
      <h2>{{ 'auth.register' | translate }}</h2>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="firstName">{{ 'auth.firstName' | translate }}</label>
          <input
            type="text"
            id="firstName"
            [(ngModel)]="firstName"
            name="firstName"
            required
            maxlength="100">
          @if (firstName.length >= 100) {
            <span class="field-error">{{ 'auth.maxLength' | translate:{ max: 100 } }}</span>
          }
        </div>

        <div class="form-group">
          <label for="lastName">{{ 'auth.lastName' | translate }}</label>
          <input
            type="text"
            id="lastName"
            [(ngModel)]="lastName"
            name="lastName"
            required
            maxlength="100">
          @if (lastName.length >= 100) {
            <span class="field-error">{{ 'auth.maxLength' | translate:{ max: 100 } }}</span>
          }
        </div>

        <div class="form-group">
          <label for="email">{{ 'auth.email' | translate }}</label>
          <input
            type="email"
            id="email"
            [(ngModel)]="email"
            name="email"
            required>
          @if (email && !isValidEmail()) {
            <span class="field-error">{{ 'auth.invalidEmail' | translate }}</span>
          }
        </div>

        <div class="form-group">
          <label for="password">{{ 'auth.password' | translate }}</label>
          <div class="password-wrapper">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="8">
            <button type="button" class="btn-eye" (click)="showPassword.set(!showPassword())">
              @if (showPassword()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          <ul class="password-hints">
            <li [class.valid]="password.length >= 8">{{ 'auth.pwMin8' | translate }}</li>
            <li [class.valid]="hasUppercase()">{{ 'auth.pwUppercase' | translate }}</li>
            <li [class.valid]="hasLowercase()">{{ 'auth.pwLowercase' | translate }}</li>
            <li [class.valid]="hasNumber()">{{ 'auth.pwNumber' | translate }}</li>
          </ul>
        </div>

        <div class="form-group">
          <label for="confirmPassword">{{ 'auth.confirmPassword' | translate }}</label>
          <div class="password-wrapper">
            <input
              [type]="showConfirmPassword() ? 'text' : 'password'"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required>
            <button type="button" class="btn-eye" (click)="showConfirmPassword.set(!showConfirmPassword())">
              @if (showConfirmPassword()) {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
          @if (confirmPassword && password !== confirmPassword) {
            <span class="field-error">{{ 'auth.passwordMismatch' | translate }}</span>
          }
        </div>

        <button type="submit" [disabled]="loading() || !isFormValid()">
          {{ loading() ? ('auth.registering' | translate) : ('auth.register' | translate) }}
        </button>
      </form>

      <p>{{ 'auth.hasAccount' | translate }} <a routerLink="/login">{{ 'auth.login' | translate }}</a></p>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 50px auto;
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
      color: var(--text-primary);
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      background: var(--input-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }
    .password-wrapper {
      position: relative;
    }
    .password-wrapper input {
      padding-right: 40px;
    }
    .btn-eye {
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      width: auto;
    }
    .btn-eye:hover {
      color: var(--text-primary);
    }
    button[type="submit"] {
      width: 100%;
      padding: 10px;
      background: var(--success);
      color: white;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }
    button[type="submit"]:disabled {
      background: var(--border-color);
    }
    .error {
      background: var(--error-bg);
      color: var(--error-text);
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .password-hints {
      list-style: none;
      padding: 0;
      margin: 8px 0 0 0;
      font-size: 0.82em;
    }
    .password-hints li {
      color: var(--text-muted);
      padding: 2px 0;
      transition: color 0.2s;
    }
    .password-hints li::before {
      content: '\\2715 ';
      color: var(--danger);
    }
    .password-hints li.valid {
      color: var(--success);
    }
    .password-hints li.valid::before {
      content: '\\2713 ';
      color: var(--success);
    }
    .field-error {
      color: var(--danger);
      font-size: 0.85em;
      margin-top: 4px;
      display: block;
    }
    p {
      text-align: center;
      margin-top: 20px;
      color: var(--text-primary);
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .register-container {
        margin: 20px 15px;
        padding: 20px;
        background: var(--bg-card);
        border-radius: 8px;
        box-shadow: 0 2px 8px var(--shadow-md);
      }
      h2 {
        text-align: center;
        margin-bottom: 25px;
      }
      input {
        padding: 12px;
        font-size: 16px;
      }
      button {
        padding: 14px;
        font-size: 1em;
        border-radius: 4px;
        margin-top: 10px;
      }
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  hasUppercase(): boolean { return /[A-Z]/.test(this.password); }
  hasLowercase(): boolean { return /[a-z]/.test(this.password); }
  hasNumber(): boolean { return /[0-9]/.test(this.password); }
  isValidEmail(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }

  isFormValid(): boolean {
    return !!(
      this.firstName && this.lastName &&
      this.email && this.isValidEmail() &&
      this.password.length >= 8 &&
      /[A-Z]/.test(this.password) &&
      /[a-z]/.test(this.password) &&
      /[0-9]/.test(this.password) &&
      this.password === this.confirmPassword
    );
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed');
        this.loading.set(false);
      }
    });
  }
}
