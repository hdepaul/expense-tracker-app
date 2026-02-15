import { Component, inject, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [TranslateModule],
  template: `
    @if (visible()) {
      <div class="onboarding-backdrop" (click)="dismiss()">
        <div class="onboarding-card" (click)="$event.stopPropagation()">
          <button class="btn-close" (click)="dismiss()">&times;</button>

          <div class="step">
            <div class="step-emoji">{{ steps[currentStep()].emoji }}</div>
            <h2 class="step-title">{{ steps[currentStep()].titleKey | translate }}</h2>
            <p class="step-desc">{{ steps[currentStep()].descKey | translate }}</p>
          </div>

          <div class="dots">
            @for (step of steps; track $index) {
              <button class="dot" [class.active]="$index === currentStep()" (click)="currentStep.set($index)"></button>
            }
          </div>

          <div class="actions">
            <button class="btn-skip" (click)="dismiss()">{{ 'onboarding.skip' | translate }}</button>
            @if (isLastStep()) {
              <button class="btn-next" (click)="dismiss()">{{ 'onboarding.start' | translate }}</button>
            } @else {
              <button class="btn-next" (click)="next()">{{ 'onboarding.next' | translate }}</button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .onboarding-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .onboarding-card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 32px 28px 24px;
      max-width: 380px;
      width: 100%;
      position: relative;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .btn-close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 1.5em;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px 8px;
      line-height: 1;
    }
    .btn-close:hover {
      color: var(--text-primary);
    }

    .step {
      padding: 8px 0 20px;
    }
    .step-emoji {
      font-size: 3em;
      margin-bottom: 12px;
    }
    .step-title {
      color: var(--text-heading);
      font-size: 1.25em;
      margin: 0 0 8px;
    }
    .step-desc {
      color: var(--text-secondary);
      font-size: 0.95em;
      line-height: 1.5;
      margin: 0;
    }

    .dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: none;
      background: var(--border-color);
      cursor: pointer;
      padding: 0;
      transition: background 0.2s, transform 0.2s;
    }
    .dot.active {
      background: var(--accent);
      transform: scale(1.2);
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-skip {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.9em;
      padding: 8px 16px;
    }
    .btn-skip:hover {
      color: var(--text-primary);
    }
    .btn-next {
      padding: 10px 28px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95em;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn-next:hover {
      background: var(--accent-hover);
    }
  `]
})
export class OnboardingComponent {
  private authService = inject(AuthService);

  steps = [
    { emoji: '\u{1F4AC}', titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc' },
    { emoji: '\u{1F4CA}', titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc' },
    { emoji: '\u{1F389}', titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc' },
  ];

  currentStep = signal(0);
  isLastStep = computed(() => this.currentStep() === this.steps.length - 1);

  private dismissed = signal(localStorage.getItem('onboarding_v1') === 'done');
  visible = computed(() => this.authService.isLoggedIn() && !this.dismissed());

  next(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  dismiss(): void {
    localStorage.setItem('onboarding_v1', 'done');
    this.dismissed.set(true);
  }
}
