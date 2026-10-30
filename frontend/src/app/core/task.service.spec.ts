import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('serializes combined task filters and order', () => {
    service.list(4, {
      status: 'pendiente',
      priority: 'alta',
      assignee: 'Ana',
      q: 'api',
      order: 'priority',
    }).subscribe();
    const request = http.expectOne((item) => item.url === 'http://localhost:3000/api/projects/4/tasks');
    expect(request.request.params.get('status')).toBe('pendiente');
    expect(request.request.params.get('priority')).toBe('alta');
    expect(request.request.params.get('assignee')).toBe('Ana');
    expect(request.request.params.get('q')).toBe('api');
    expect(request.request.params.get('order')).toBe('priority');
    request.flush([]);
  });

  it('changes a task status quickly', () => {
    service.updateStatus(7, 'en_progreso').subscribe();
    const request = http.expectOne('http://localhost:3000/api/tasks/7/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ status: 'en_progreso' });
    request.flush({ id: 7 });
  });
});
