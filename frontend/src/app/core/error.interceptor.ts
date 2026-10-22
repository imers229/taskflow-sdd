import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (_request, next) =>
  next(_request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        typeof error.error?.error === 'string'
          ? error.error.error
          : 'No se pudo conectar con el servidor';
      return throwError(() => new Error(message));
    }),
  );
