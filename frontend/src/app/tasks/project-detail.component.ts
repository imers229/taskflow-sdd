import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ProjectService } from '../core/project.service';
import { TaskService } from '../core/task.service';
import { SummaryService } from '../core/summary.service';
import { Priority, Project, ProjectSummary, Task, TaskFilters, TaskStatus } from '../core/models';
import { SummaryPanelComponent } from '../dashboard/summary-panel.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SummaryPanelComponent],
  template: `
    @if (loading) { <p aria-live="polite">Cargando proyecto...</p> }
    @if (errorMessage) { <p class="error" role="alert">{{ errorMessage }}</p> }
    @if (project) {
      <section class="grid">
        <div class="actions">
          <div><h1>{{ project.name }}</h1><p>{{ project.description || 'Sin descripción' }}</p></div>
          <a [routerLink]="['/projects', project.id, 'tasks', 'new']"><button type="button">Nueva tarea</button></a>
        </div>
        <app-summary-panel
          [summary]="summary"
          [loading]="summaryLoading"
          [errorMessage]="summaryError"
        />
        <form class="card grid two-columns" [formGroup]="filterForm">
          <label>Buscar por título<input formControlName="q"></label>
          <label>Responsable<input formControlName="assignee"></label>
          <label>Estado
            <select formControlName="status"><option value="">Todos</option><option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option></select>
          </label>
          <label>Prioridad
            <select formControlName="priority"><option value="">Todas</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select>
          </label>
          <label>Orden
            <select formControlName="order"><option value="created_desc">Más recientes</option><option value="created_asc">Más antiguas</option><option value="title">Título</option><option value="priority">Prioridad</option></select>
          </label>
        </form>
        @if (tasksLoading) { <p aria-live="polite">Cargando tareas...</p> }
        @if (!tasksLoading && tasks.length === 0) {
          <p class="empty">{{ hasFilters ? 'Sin resultados.' : 'Este proyecto no tiene tareas.' }}</p>
        }
        <div class="grid">
          @for (task of tasks; track task.id) {
            <article class="card">
              <div class="actions">
                <h2>{{ task.title }}</h2>
                <a [routerLink]="['tasks', task.id, 'edit']">Editar</a>
              </div>
              <p>{{ task.description || 'Sin descripción' }}</p>
              <p>Prioridad: {{ task.priority }} · Responsable: {{ task.assignee || 'Sin asignar' }}</p>
              <label>Estado
                <select [value]="task.status" (change)="changeStatus(task, $any($event.target).value)">
                  <option value="pendiente">Pendiente</option><option value="en_progreso">En progreso</option><option value="completada">Completada</option>
                </select>
              </label>
              <button type="button" class="danger" (click)="remove(task)">Eliminar</button>
            </article>
          }
        </div>
      </section>
    }
  `,
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly summaryService = inject(SummaryService);
  private readonly builder = inject(FormBuilder);
  public project: Project | null = null;
  public tasks: Task[] = [];
  public loading = false;
  public tasksLoading = false;
  public errorMessage = '';
  public summary: ProjectSummary | null = null;
  public summaryLoading = false;
  public summaryError = '';
  public hasFilters = false;
  private projectId = 0;
  public readonly filterForm = this.builder.nonNullable.group({
    status: '' as TaskStatus | '',
    priority: '' as Priority | '',
    assignee: '',
    q: '',
    order: 'created_desc' as TaskFilters['order'],
  });

  public ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject();
    this.filterForm.valueChanges.subscribe(() => this.loadTasks());
  }

  public changeStatus(task: Task, status: TaskStatus): void {
    const previous = task.status;
    this.taskService.updateStatus(task.id, status).subscribe({
      next: (updated) => { task.status = updated.status; this.loadSummary(); },
      error: (error: Error) => { task.status = previous; this.errorMessage = error.message; },
    });
  }

  public remove(task: Task): void {
    const confirmation = window.prompt(`Escribe "${task.title}" para eliminar la tarea.`);
    if (confirmation === null) return;
    this.taskService.remove(task.id, confirmation).subscribe({
      next: () => { this.loadTasks(); this.loadSummary(); },
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }

  private loadProject(): void {
    this.loading = true;
    this.projectService.get(this.projectId).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (project) => {
        this.project = project;
        this.loadTasks();
        this.loadSummary();
      },
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }

  private loadSummary(): void {
    this.summaryLoading = true;
    this.summaryError = '';
    this.summaryService.get(this.projectId)
      .pipe(finalize(() => (this.summaryLoading = false)))
      .subscribe({
        next: (summary) => { this.summary = summary; },
        error: (error: Error) => { this.summaryError = error.message; },
      });
  }

  private loadTasks(): void {
    this.tasksLoading = true;
    const filters = this.filterForm.getRawValue();
    this.hasFilters = Boolean(filters.status || filters.priority || filters.assignee.trim() || filters.q.trim());
    this.taskService.list(this.projectId, filters).pipe(finalize(() => (this.tasksLoading = false))).subscribe({
      next: (tasks) => { this.tasks = tasks; },
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }
}
