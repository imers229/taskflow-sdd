import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryPanelComponent } from './summary-panel.component';

describe('SummaryPanelComponent', () => {
  let fixture: ComponentFixture<SummaryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryPanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SummaryPanelComponent);
  });

  it('shows all project metrics', () => {
    fixture.componentInstance.summary = {
      total: 4,
      pendiente: 1,
      en_progreso: 1,
      completada: 2,
      vencidas: 1,
      completedPercentage: 50,
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Total');
    expect(fixture.nativeElement.textContent).toContain('50%');
    expect(fixture.nativeElement.textContent).toContain('Vencidas');
  });
});
