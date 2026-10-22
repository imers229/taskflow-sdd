import { Routes } from '@angular/router';

import { ProjectsPageComponent } from './projects/projects-page.component';
import { ProjectDetailComponent } from './tasks/project-detail.component';
import { TaskFormComponent } from './tasks/task-form.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'projects' },
  { path: 'projects', component: ProjectsPageComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'projects/:id/tasks/new', component: TaskFormComponent },
  { path: 'projects/:id/tasks/:taskId/edit', component: TaskFormComponent },
];
