import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private router: Router,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (typeof window !== 'undefined') {
            const currentUser = JSON.parse(localStorage.getItem('currentUser')??'{}');
            
            if (currentUser && currentUser.token) {
                // if logged return true
                return true;
            }

            // not logged in so redirect to login page with the return url
            if (!sessionStorage.getItem('returnUrl')) {
                sessionStorage.setItem('returnUrl', state.url);
            }

            this.router.navigate(['/login']);
        }
        return false;
    }
}