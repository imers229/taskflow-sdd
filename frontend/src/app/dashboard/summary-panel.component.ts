import { Component, Input } from '@angular/core';

import { ProjectSummary } from '../core/models';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  template: `
    <section class="card" aria-labelledby="summary-title">
      <h2 id="summary-title">Resumen del proyecto</h2>
      @if (loading) {
        <p aria-live="polite">Cargando resumen...</p>
      } @else if (errorMessage) {
        <p class="error" role="alert">{{ errorMessage }}</p>
      } @else if (summary) {
        <div class="summary-grid">
          <div><strong>Total</strong><span>{{ summary.total }}</span></div>
          <div><strong>Pendientes</strong><span>{{ summary.pendiente }}</span></div>
          <div><strong>En progreso</strong><span>{{ summary.en_progreso }}</span></div>
          <div><strong>Completadas</strong><span>{{ summary.completada }}</span></div>
          <div><strong>Vencidas</strong><span>{{ summary.vencidas }}</span></div>
          <div><strong>Completado</strong><span>{{ summary.completedPercentage }}%</span></div>
        </div>
      }
    </section>
  `,
  styles: [`
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .75rem; }
    .summary-grid div { display: grid; gap: .25rem; padding: .75rem; background: #eef3f8; border-radius: 4px; }
    .summary-grid span { font-size: 1.35rem; }
  `],
})
export class SummaryPanelComponent {
  @Input() public summary: ProjectSummary | null = null;
  @Input() public loading = false;
  @Input() public errorMessage = '';
}
