import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from './api.config';
import { Project, ProjectInput } from './models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  public list(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_URL}/projects`);
  }

  public get(id: number): Observable<Project> {
    return this.http.get<Project>(`${API_URL}/projects/${id}`);
  }

  public create(input: ProjectInput): Observable<Project> {
    return this.http.post<Project>(`${API_URL}/projects`, input);
  }

  public update(id: number, input: ProjectInput): Observable<Project> {
    return this.http.put<Project>(`${API_URL}/projects/${id}`, input);
  }

  public remove(id: number, confirmationName: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/projects/${id}`, {
      body: { confirmationName },
    });
  }
}
