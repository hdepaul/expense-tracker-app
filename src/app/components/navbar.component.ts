import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <nav class="navbar" [class.logged-in]="authService.isLoggedIn()">
      <a routerLink="/" class="brand">{{ 'app.title' | translate }}</a>

      <button class="hamburger" (click)="toggleMenu()" [class.active]="menuOpen()">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-content" [class.open]="menuOpen()">
        @if (authService.isLoggedIn()) {
          <div class="nav-links">
            <a routerLink="/" (click)="closeMenu()">{{ 'nav.home' | translate }}</a>
            <a routerLink="/expenses" (click)="closeMenu()">{{ 'nav.myExpenses' | translate }}</a>
            <a routerLink="/reports" (click)="closeMenu()">{{ 'nav.reports' | translate }}</a>
            @if (authService.isAdmin()) {
              <a routerLink="/admin" (click)="closeMenu()">{{ 'nav.admin' | translate }}</a>
            }
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

        <div class="nav-toolbar">
          <button (click)="shareApp()" class="btn-share" [title]="'home.share' | translate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            @if (showCopied()) { <span class="copied-tooltip">{{ 'home.copied' | translate }}</span> }
          </button>
          <button (click)="toggleTheme()" class="btn-theme" [title]="isDark() ? ('nav.lightMode' | translate) : ('nav.darkMode' | translate)">
            @if (isDark()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button (click)="toggleLang()" class="btn-lang">{{ currentLang() }}</button>
          @if (authService.isLoggedIn()) {
            <button (click)="logout()" class="btn-logout-icon" [title]="'nav.logout' | translate">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          }
        </div>
      </div>
    </nav>

    @if (authService.isLoggedIn()) {
      <nav class="bottom-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>{{ 'nav.home' | translate }}</span>
        </a>
        <a routerLink="/expenses" routerLinkActive="active" class="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>{{ 'nav.myExpenses' | translate }}</span>
        </a>
        <a routerLink="/reports" routerLinkActive="active" class="bottom-nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          <span>{{ 'nav.reports' | translate }}</span>
        </a>
        @if (authService.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="bottom-nav-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>{{ 'nav.admin' | translate }}</span>
          </a>
        }
      </nav>
    }
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 15px 30px;
      background: var(--bg-nav);
      color: white;
      position: relative;
      transition: background 0.3s;
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
      color: var(--nav-link);
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
      color: var(--nav-text);
    }
    .btn-logout {
      padding: 8px 16px;
      background: var(--danger);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-logout:hover {
      background: var(--danger-hover);
    }
    .btn-logout-icon {
      display: none;
      padding: 6px 10px;
      background: transparent;
      color: var(--danger);
      border: 1px solid var(--danger);
      border-radius: 4px;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-logout-icon:hover {
      color: white;
      background: var(--danger);
    }
    .nav-toolbar {
      display: flex;
      align-items: center;
      margin-left: 15px;
      gap: 8px;
    }
    .btn-share {
      padding: 6px 10px;
      background: transparent;
      color: var(--nav-text);
      border: 1px solid var(--nav-text);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      position: relative;
      transition: all 0.2s;
    }
    .btn-share:hover {
      color: white;
      border-color: white;
    }
    .copied-tooltip {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--success);
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75em;
      white-space: nowrap;
    }
    .btn-theme {
      padding: 6px 10px;
      background: transparent;
      color: var(--nav-text);
      border: 1px solid var(--nav-text);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-theme:hover {
      color: white;
      border-color: white;
    }
    .btn-lang {
      padding: 6px 12px;
      background: transparent;
      color: var(--nav-text);
      border: 1px solid var(--nav-text);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
      text-transform: uppercase;
    }
    .btn-lang:hover {
      color: white;
      border-color: white;
    }

    /* Bottom nav - hidden on desktop */
    .bottom-nav {
      display: none;
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
        border-bottom: 1px solid var(--nav-border);
      }
      .user-menu {
        margin-left: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--nav-border);
      }
      .user-name {
        text-align: center;
      }
      .btn-logout {
        width: 100%;
      }
      .nav-toolbar {
        margin-left: 0;
        margin-top: 10px;
        justify-content: center;
      }
      .btn-share, .btn-theme, .btn-lang {
        flex: 1;
        justify-content: center;
      }

      /* === Logged-in mobile: compact top bar + bottom nav === */
      .navbar.logged-in {
        flex-wrap: nowrap;
      }
      .navbar.logged-in .hamburger {
        display: none;
      }
      .navbar.logged-in .nav-content {
        display: flex;
        width: auto;
        flex-direction: row;
        align-items: center;
        gap: 0;
        padding-top: 0;
        margin-left: auto;
      }
      .navbar.logged-in .nav-links,
      .navbar.logged-in .user-menu {
        display: none;
      }
      .navbar.logged-in .nav-toolbar {
        margin-top: 0;
        margin-left: 0;
        gap: 4px;
      }
      .navbar.logged-in .nav-toolbar .btn-share,
      .navbar.logged-in .nav-toolbar .btn-theme,
      .navbar.logged-in .nav-toolbar .btn-lang {
        flex: none;
        border: none;
        padding: 6px;
      }
      .navbar.logged-in .btn-logout-icon {
        display: flex;
        border: none;
        padding: 6px;
      }
      .navbar.logged-in .brand {
        flex-shrink: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Bottom nav */
      .bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: var(--bg-nav);
        border-top: 1px solid var(--nav-border);
        padding: 4px 0;
        padding-bottom: env(safe-area-inset-bottom, 4px);
      }
      .bottom-nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 6px 4px;
        color: var(--nav-link);
        text-decoration: none;
        font-size: 0.65em;
        transition: color 0.2s;
      }
      .bottom-nav-item.active {
        color: var(--accent);
        font-weight: bold;
      }
      .bottom-nav-item:hover {
        text-decoration: none;
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  menuOpen = signal(false);
  showCopied = signal(false);
  isDark = signal(false);

  constructor() {
    // Apply saved theme on load
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDark.set(true);
      document.documentElement.setAttribute('data-theme', 'dark');
      this.updateThemeColor('#0f3460');
    }
  }

  currentLang(): string {
    return this.translate.currentLang || 'en';
  }

  toggleLang(): void {
    const newLang = this.currentLang() === 'en' ? 'es' : 'en';
    this.translate.use(newLang);
  }

  toggleTheme(): void {
    const dark = !this.isDark();
    this.isDark.set(dark);
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      this.updateThemeColor('#0f3460');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      this.updateThemeColor('#343a40');
    }
  }

  private updateThemeColor(color: string): void {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', color);
    }
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
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
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
