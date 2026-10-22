import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from './api.config';
import { ProjectSummary } from './models';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private readonly http = inject(HttpClient);

  public get(projectId: number): Observable<ProjectSummary> {
    return this.http.get<ProjectSummary>(`${API_URL}/projects/${projectId}/summary`);
  }
}
