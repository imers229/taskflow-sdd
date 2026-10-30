import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ProjectService } from '../core/project.service';
import { Project } from '../core/models';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="grid">
      <div class="actions">
        <h1>Proyectos</h1>
        <button type="button" (click)="startCreate()">Nuevo proyecto</button>
      </div>
      @if (loading) { <p aria-live="polite">Cargando proyectos...</p> }
      @if (errorMessage) { <p class="error" role="alert">{{ errorMessage }}</p> }
      @if (!loading && projects.length === 0) {
        <p class="empty">Aún no hay proyectos.</p>
      }
      <div class="grid two-columns">
        @for (project of projects; track project.id) {
          <article class="card">
            <h2><a [routerLink]="['/projects', project.id]">{{ project.name }}</a></h2>
            <p>{{ project.description || 'Sin descripción' }}</p>
            <div class="actions">
              <button type="button" class="secondary" (click)="startEdit(project)">Editar</button>
              <button type="button" class="danger" (click)="remove(project)">Eliminar</button>
            </div>
          </article>
        }
      </div>
      @if (showForm) {
        <form class="card grid" [formGroup]="form" (ngSubmit)="save()">
          <h2>{{ editing ? 'Editar proyecto' : 'Nuevo proyecto' }}</h2>
          <label>Nombre
            <input formControlName="name" required aria-describedby="project-name-error">
          </label>
          @if (form.controls.name.invalid && form.controls.name.touched) {
            <span id="project-name-error" class="error">Escribe entre 3 y 100 caracteres.</span>
          }
          <label>Descripción
            <textarea formControlName="description" rows="3"></textarea>
          </label>
          @if (form.controls.description.invalid && form.controls.description.touched) {
            <span class="error">La descripción no puede superar 500 caracteres.</span>
          }
          <div class="actions">
            <button type="submit" [disabled]="saving">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
            <button type="button" class="secondary" (click)="showForm = false">Cancelar</button>
          </div>
        </form>
      }
    </section>
  `,
})
export class ProjectsPageComponent implements OnInit {
  private readonly service = inject(ProjectService);
  private readonly builder = inject(FormBuilder);
  public projects: Project[] = [];
  public loading = false;
  public saving = false;
  public showForm = false;
  public errorMessage = '';
  public editing: Project | null = null;
  public readonly form = this.builder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  public ngOnInit(): void { this.load(); }

  public startCreate(): void {
    this.editing = null;
    this.form.reset();
    this.showForm = true;
  }

  public startEdit(project: Project): void {
    this.editing = project;
    this.form.setValue({ name: project.name, description: project.description ?? '' });
    this.showForm = true;
  }

  public save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving = true;
    this.errorMessage = '';
    const input = this.form.getRawValue();
    const operation = this.editing
      ? this.service.update(this.editing.id, input)
      : this.service.create(input);
    operation.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => { this.showForm = false; this.load(); },
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }

  public remove(project: Project): void {
    const confirmation = window.prompt(`Escribe "${project.name}" para eliminar el proyecto y sus tareas.`);
    if (confirmation === null) return;
    this.service.remove(project.id, confirmation).subscribe({
      next: () => this.load(),
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }

  private load(): void {
    this.loading = true;
    this.service.list().pipe(finalize(() => (this.loading = false))).subscribe({
      next: (projects) => { this.projects = projects; },
      error: (error: Error) => { this.errorMessage = error.message; },
    });
  }
}
