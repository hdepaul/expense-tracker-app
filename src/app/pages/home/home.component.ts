import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="home-container">
      @if (authService.isLoggedIn()) {
        <h1>{{ 'home.welcome' | translate }}, {{ authService.currentUser()?.firstName }}!</h1>
        <p>{{ 'home.email' | translate }}: {{ authService.currentUser()?.email }}</p>
        <div class="actions">
          <a routerLink="/expenses" class="btn-expenses">{{ 'nav.myExpenses' | translate }}</a>
          <button (click)="logout()">{{ 'nav.logout' | translate }}</button>
        </div>
      } @else {
        <h1>{{ 'home.welcomeGuest' | translate }}</h1>
        <p>{{ 'home.pleaseLogin' | translate }} <a routerLink="/login">{{ 'nav.login' | translate }}</a></p>
      }
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }
    .btn-expenses {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    button {
      padding: 10px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .home-container {
        margin: 30px 15px;
        padding: 20px;
      }
      h1 {
        font-size: 1.5em;
      }
      .actions {
        flex-direction: column;
      }
      .btn-expenses, button {
        padding: 14px 20px;
        font-size: 1em;
      }
    }
  `]
})
export class HomeComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
