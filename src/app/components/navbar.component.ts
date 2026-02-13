import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">{{ 'app.title' | translate }}</a>

      <button class="hamburger" (click)="toggleMenu()" [class.active]="menuOpen()">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-content" [class.open]="menuOpen()">
        @if (authService.isLoggedIn()) {
          <div class="nav-links">
            <a routerLink="/expenses" (click)="closeMenu()">{{ 'nav.myExpenses' | translate }}</a>
            <a routerLink="/reports" (click)="closeMenu()">{{ 'nav.reports' | translate }}</a>
            <a routerLink="/expenses/new" (click)="closeMenu()">+ {{ 'nav.new' | translate }}</a>
          </div>
          <div class="user-menu">
            <span class="user-name">{{ authService.currentUser()?.firstName }}</span>
            <button (click)="logout()" class="btn-logout">{{ 'nav.logout' | translate }}</button>
          </div>
        } @else {
          <div class="nav-links">
            <a routerLink="/login" (click)="closeMenu()">{{ 'nav.login' | translate }}</a>
            <a routerLink="/register" (click)="closeMenu()">{{ 'nav.register' | translate }}</a>
          </div>
        }

        <button (click)="toggleLang()" class="btn-lang">{{ currentLang() }}</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 15px 30px;
      background: #343a40;
      color: white;
      position: relative;
    }
    .brand {
      font-size: 1.3em;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      margin-left: auto;
    }
    .hamburger span {
      display: block;
      width: 25px;
      height: 3px;
      background: white;
      border-radius: 2px;
      transition: transform 0.3s, opacity 0.3s;
    }
    .hamburger.active span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 6px);
    }
    .hamburger.active span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.active span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -6px);
    }
    .nav-content {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
    .nav-links {
      display: flex;
      gap: 20px;
    }
    .nav-links a {
      color: #ccc;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: white;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-left: 30px;
    }
    .user-name {
      color: #adb5bd;
    }
    .btn-logout {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-logout:hover {
      background: #c82333;
    }
    .btn-lang {
      margin-left: 15px;
      padding: 6px 12px;
      background: transparent;
      color: #adb5bd;
      border: 1px solid #adb5bd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
      text-transform: uppercase;
    }
    .btn-lang:hover {
      color: white;
      border-color: white;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .navbar {
        padding: 12px 15px;
      }
      .hamburger {
        display: flex;
      }
      .nav-content {
        display: none;
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
        padding-top: 15px;
        margin-left: 0;
      }
      .nav-content.open {
        display: flex;
      }
      .nav-links {
        flex-direction: column;
        gap: 0;
      }
      .nav-links a {
        padding: 12px 0;
        border-bottom: 1px solid #495057;
      }
      .user-menu {
        margin-left: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid #495057;
      }
      .user-name {
        text-align: center;
      }
      .btn-logout {
        width: 100%;
      }
      .btn-lang {
        margin-left: 0;
        margin-top: 10px;
        width: 100%;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  menuOpen = signal(false);

  currentLang(): string {
    return this.translate.currentLang || 'en';
  }

  toggleLang(): void {
    const newLang = this.currentLang() === 'en' ? 'es' : 'en';
    this.translate.use(newLang);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
