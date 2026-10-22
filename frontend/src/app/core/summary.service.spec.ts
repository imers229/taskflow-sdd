import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SummaryService } from './summary.service';

describe('SummaryService', () => {
  let service: SummaryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SummaryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SummaryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests the summary for a project', () => {
    service.get(8).subscribe();
    const request = http.expectOne(
      'http://localhost:3000/api/projects/8/summary',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ total: 0 });
  });
});
