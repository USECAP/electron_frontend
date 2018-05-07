import {Component} from '@angular/core';
import '@clr/icons/shapes/all-shapes';

@Component({
  selector: 'app-root',
  template: `
    <div class="main-container">
      <header class="header header-6">
        <div class="branding">
          <span class="title">Code Intelligence // Security Scanner</span>
        </div>
        <div class="header-nav">
          <a routerLink="/" class="nav-link nav-text">Dashboard</a>
        </div>
      </header>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
}
