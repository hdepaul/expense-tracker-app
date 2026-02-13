import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('my-app');
  private translate = inject(TranslateService);

  constructor() {
    // Detect browser language and set default
    const browserLang = this.translate.getBrowserLang();
    const supportedLangs = ['en', 'es'];
    const defaultLang = supportedLangs.includes(browserLang || '') ? browserLang! : 'es';

    this.translate.setDefaultLang('es');
    this.translate.use(defaultLang);
    document.documentElement.lang = defaultLang;

    this.translate.onLangChange.subscribe(event => {
      document.documentElement.lang = event.lang;
    });
  }
}
