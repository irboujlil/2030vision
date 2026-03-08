import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-nav></app-nav>
    <main class="pt-14 min-h-screen">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {}
