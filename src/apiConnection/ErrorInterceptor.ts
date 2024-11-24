import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            
            if (err.status === 401 || err.status === 403) {

                // auto logout if 401 response returned from api
                localStorage.removeItem('user');
                sessionStorage.setItem('returnUrl', this.router.url);
                
                this.router.navigate(['/login']);
            }

            const error = err.error.message || err.error || err.statusText;
            return throwError(() => error);
        }))
    }
}