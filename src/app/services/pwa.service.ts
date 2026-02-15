import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PwaService {
  private deferredPrompt = signal<any>(null);
  canInstall = computed(() => !!this.deferredPrompt());

  constructor() {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt.set(e);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt.set(null);
    });
  }

  async install(): Promise<void> {
    const prompt = this.deferredPrompt();
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      this.deferredPrompt.set(null);
    }
  }
}
