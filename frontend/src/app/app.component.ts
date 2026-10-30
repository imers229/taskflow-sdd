import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <header class="card">
      <div class="container actions">
        <a routerLink="/projects"><strong>TaskFlow</strong></a>
        <a routerLink="/projects">Proyectos</a>
      </div>
    </header>
    <main class="container"><router-outlet /></main>
  `,
})
export class AppComponent {}
