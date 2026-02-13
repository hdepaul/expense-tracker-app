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
            required>
        </div>

        <div class="form-group">
          <label for="lastName">{{ 'auth.lastName' | translate }}</label>
          <input
            type="text"
            id="lastName"
            [(ngModel)]="lastName"
            name="lastName"
            required>
        </div>

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
          <input
            type="password"
            id="password"
            [(ngModel)]="password"
            name="password"
            required
            minlength="8">
          <ul class="password-hints">
            <li [class.valid]="password.length >= 8">{{ 'auth.pwMin8' | translate }}</li>
            <li [class.valid]="hasUppercase()">{{ 'auth.pwUppercase' | translate }}</li>
            <li [class.valid]="hasLowercase()">{{ 'auth.pwLowercase' | translate }}</li>
            <li [class.valid]="hasNumber()">{{ 'auth.pwNumber' | translate }}</li>
          </ul>
        </div>

        <div class="form-group">
          <label for="confirmPassword">{{ 'auth.confirmPassword' | translate }}</label>
          <input
            type="password"
            id="confirmPassword"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required>
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
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #28a745;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
    }
    .error {
      background: #f8d7da;
      color: #721c24;
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
      color: #999;
      padding: 2px 0;
      transition: color 0.2s;
    }
    .password-hints li::before {
      content: '✕ ';
      color: #dc3545;
    }
    .password-hints li.valid {
      color: #28a745;
    }
    .password-hints li.valid::before {
      content: '✓ ';
      color: #28a745;
    }
    .field-error {
      color: #dc3545;
      font-size: 0.85em;
      margin-top: 4px;
      display: block;
    }
    p {
      text-align: center;
      margin-top: 20px;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .register-container {
        margin: 20px 15px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 {
        text-align: center;
        margin-bottom: 25px;
      }
      input {
        padding: 12px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
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

  hasUppercase(): boolean { return /[A-Z]/.test(this.password); }
  hasLowercase(): boolean { return /[a-z]/.test(this.password); }
  hasNumber(): boolean { return /[0-9]/.test(this.password); }

  isFormValid(): boolean {
    return !!(
      this.firstName && this.lastName && this.email &&
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
