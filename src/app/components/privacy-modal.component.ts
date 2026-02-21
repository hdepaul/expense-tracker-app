import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy-modal',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (visible()) {
      <div class="privacy-backdrop">
        <div class="privacy-card">
          <div class="privacy-icon">🔒</div>
          <h2 class="privacy-title">{{ 'privacy.title' | translate }}</h2>
          <p class="privacy-subtitle">{{ 'privacy.subtitle' | translate }}</p>

          <ul class="privacy-list">
            <li>
              <span class="privacy-check">✓</span>
              {{ 'privacy.point1' | translate }}
            </li>
            <li>
              <span class="privacy-check">✓</span>
              {{ 'privacy.point2' | translate }}
            </li>
            <li>
              <span class="privacy-check">✓</span>
              {{ 'privacy.point3' | translate }}
            </li>
            <li>
              <span class="privacy-check">✓</span>
              {{ 'privacy.point4' | translate }}
            </li>
          </ul>

          <button class="btn-accept" (click)="accept()">{{ 'privacy.accept' | translate }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .privacy-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .privacy-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 36px 28px 28px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .privacy-icon {
      font-size: 3em;
      margin-bottom: 12px;
    }

    .privacy-title {
      color: var(--text-heading);
      font-size: 1.3em;
      margin: 0 0 8px;
    }

    .privacy-subtitle {
      color: var(--text-secondary);
      font-size: 0.9em;
      margin: 0 0 20px;
      line-height: 1.5;
    }

    .privacy-list {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .privacy-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      color: var(--text-secondary);
      font-size: 0.9em;
      line-height: 1.4;
    }

    .privacy-check {
      color: var(--accent);
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .btn-accept {
      width: 100%;
      padding: 12px 28px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      font-weight: 600;
      transition: background 0.2s;
    }
    .btn-accept:hover {
      background: var(--accent-hover);
    }
  `]
})
export class PrivacyModalComponent {
  private dismissed = signal(localStorage.getItem('privacy_v1') === 'accepted');
  visible = this.dismissed() === false ? signal(true) : signal(false);

  accept(): void {
    localStorage.setItem('privacy_v1', 'accepted');
    this.visible.set(false);
  }
}
