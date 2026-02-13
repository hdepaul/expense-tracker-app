import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    @if (authService.isLoggedIn()) {
      <div class="home-logged">
        <h1>{{ 'home.welcome' | translate }}, {{ authService.currentUser()?.firstName }}!</h1>
        <div class="actions">
          <a routerLink="/expenses" class="btn-primary">{{ 'nav.myExpenses' | translate }}</a>
          <button (click)="logout()" class="btn-outline">{{ 'nav.logout' | translate }}</button>
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
        </section>
      </div>
    }
  `,
  styles: [`
    /* Logged in */
    .home-logged {
      max-width: 600px;
      margin: 80px auto;
      padding: 40px 20px;
      text-align: center;
    }
    .home-logged h1 {
      font-size: 2em;
      margin-bottom: 24px;
      color: #1a1a1a;
    }
    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    /* Buttons */
    .btn-primary {
      display: inline-block;
      padding: 12px 28px;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95em;
      border: 2px solid #007bff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      background: #0056b3;
      border-color: #0056b3;
    }
    .btn-outline {
      display: inline-block;
      padding: 12px 28px;
      background: transparent;
      color: #007bff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95em;
      border: 2px solid #007bff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline:hover {
      background: #007bff;
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
      background: #e8f0fe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: #007bff;
    }
    .hero h1 {
      font-size: 2.5em;
      color: #1a1a1a;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .hero-subtitle {
      font-size: 1.2em;
      color: #666;
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
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }
    .feature-icon {
      width: 60px;
      height: 60px;
      background: #e8f0fe;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: #007bff;
    }
    .feature-card h3 {
      font-size: 1.1em;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    .feature-card p {
      color: #666;
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
      color: #1a1a1a;
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
      background: #007bff;
      color: white;
      border-radius: 50%;
      font-size: 1.2em;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .step p {
      color: #444;
      font-size: 0.95em;
      line-height: 1.4;
    }
    .step-arrow {
      color: #ccc;
      font-size: 1.5em;
      margin-top: -20px;
    }

    /* CTA */
    .cta {
      text-align: center;
      padding: 48px 32px;
      background: #f0f7ff;
      border-radius: 16px;
      margin-bottom: 60px;
    }
    .cta h2 {
      font-size: 1.6em;
      color: #1a1a1a;
      margin-bottom: 20px;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .home-logged {
        margin: 40px 15px;
        padding: 30px 20px;
      }
      .home-logged h1 {
        font-size: 1.5em;
      }
      .actions {
        flex-direction: column;
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
