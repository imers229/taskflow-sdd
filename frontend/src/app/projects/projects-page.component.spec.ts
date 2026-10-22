import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProjectsPageComponent } from './projects-page.component';
import { ProjectService } from '../core/project.service';

describe('ProjectsPageComponent', () => {
  let fixture: ComponentFixture<ProjectsPageComponent>;
  const projectService = {
    list: vi.fn(() => of([])),
    create: vi.fn(() => of({})),
    update: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPageComponent],
      providers: [{ provide: ProjectService, useValue: projectService }, provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsPageComponent);
    fixture.detectChanges();
  });

  it('shows the empty projects state', () => {
    expect(fixture.nativeElement.textContent).toContain('Aún no hay proyectos');
  });

  it('does not submit an invalid project form', () => {
    fixture.componentInstance.startCreate();
    fixture.componentInstance.save();
    expect(projectService.create).not.toHaveBeenCalled();
  });
});
