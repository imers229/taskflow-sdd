import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TaskFormComponent } from './task-form.component';
import { TaskService } from '../core/task.service';

describe('TaskFormComponent', () => {
  let fixture: ComponentFixture<TaskFormComponent>;
  const taskService = {
    create: vi.fn(() => of({})),
    update: vi.fn(() => of({})),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        { provide: TaskService, useValue: taskService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TaskFormComponent);
    fixture.detectChanges();
  });

  it('requires a valid title before submitting', () => {
    fixture.componentInstance.form.controls.title.setValue('x');
    fixture.componentInstance.save();
    expect(taskService.create).not.toHaveBeenCalled();
  });
});
