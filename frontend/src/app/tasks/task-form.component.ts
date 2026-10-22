import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TaskService } from '../core/task.service';
import { Priority, TaskStatus } from '../core/models';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="card">
      <h1>{{ taskId ? 'Editar tarea' : 'Nueva tarea' }}</h1>
      @if (errorMessage) { <p class="error" role="alert">{{ errorMessage }}</p> }
      <form class="grid" [formGroup]="form" (ngSubmit)="save()">
        <label>Título
          <input formControlName="title" required aria-describedby="title-error">
        </label>
        @if (form.controls.title.invalid && form.controls.title.touched) {
          <span id="title-error" class="error">El título debe tener entre 3 y 100 caracteres.</span>
        }
        <label>Descripción
          <textarea formControlName="description" rows="4"></textarea>
        </label>
        @if (form.controls.description.invalid && form.controls.description.touched) {
          <span class="error">La descripción no puede superar 500 caracteres.</span>
        }
        <label>Prioridad
          <select formControlName="priority">
            <option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>
          </select>
        </label>
        @if (taskId) {
          <label>Estado
            <select formControlName="status">
              <option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option>
            </select>
          </label>
        }
        <label>Responsable<input formControlName="assignee"></label>
        <label>Fecha límite<input type="date" formControlName="dueDate"></label>
        <div class="actions">
          <button type="submit" [disabled]="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          <a [routerLink]="['/projects', projectId]"><button type="button" class="secondary">Cancelar</button></a>
        </div>
      </form>
    </section>
  `,
})
export class TaskFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(TaskService);
  private readonly builder = inject(FormBuilder);
  public projectId = 0;
  public taskId: number | null = null;
  public saving = false;
  public errorMessage = '';
  public readonly form = this.builder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    priority: 'media' as Priority,
    status: 'pendiente' as TaskStatus,
    assignee: '',
    dueDate: '',
  });

  public ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    const taskId = this.route.snapshot.paramMap.get('taskId');
    this.taskId = taskId ? Number(taskId) : null;
    if (this.taskId) {
      this.service.get(this.taskId).subscribe({
        next: (task) => this.form.patchValue({
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          status: task.status,
          assignee: task.assignee ?? '',
          dueDate: task.due_date ?? '',
        }),
        error: (error: Error) => { this.errorMessage = error.message; },
      });
    }
  }

  public save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    const value = this.form.getRawValue();
    const operation = this.taskId
      ? this.service.update(this.taskId, value)
      : this.service.create(this.projectId, value);
    operation.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => void this.router.navigate(['/projects', this.projectId]),
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }
}
