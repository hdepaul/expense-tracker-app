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
      <h2>{{ 'auth.login' | translate }}</h2>

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
          <input
            type="password"
            id="password"
            [(ngModel)]="password"
            name="password"
            required>
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
      background: #007bff;
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
    p {
      text-align: center;
      margin-top: 20px;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .login-container {
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
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  onSubmit(): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Login failed');
          this.loading.set(false);
        }
      });
  }
}
