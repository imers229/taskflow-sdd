import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from './api.config';
import { Task, TaskFilters, TaskInput, TaskStatus } from './models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  public list(projectId: number, filters: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.assignee.trim()) params = params.set('assignee', filters.assignee.trim());
    if (filters.q.trim()) params = params.set('q', filters.q.trim());
    params = params.set('order', filters.order);
    return this.http.get<Task[]>(`${API_URL}/projects/${projectId}/tasks`, { params });
  }

  public get(id: number): Observable<Task> {
    return this.http.get<Task>(`${API_URL}/tasks/${id}`);
  }

  public create(projectId: number, input: TaskInput): Observable<Task> {
    return this.http.post<Task>(`${API_URL}/projects/${projectId}/tasks`, input);
  }

  public update(id: number, input: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${API_URL}/tasks/${id}`, input);
  }

  public remove(id: number, confirmationName: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/tasks/${id}`, {
      body: { confirmationName },
    });
  }

  public updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${API_URL}/tasks/${id}/status`, { status });
  }
}
