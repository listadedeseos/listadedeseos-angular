import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './ApiService';

import { Router } from '@angular/router';
import { User } from './model/user';
import { Utils } from '../utils/utils';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;

  public currentUser: Observable<User>;

  public isLogged = false;
  public isAdmin = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser')!)
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.setRoles();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  private setRoles() {
    this.isLogged = this.currentUserSubject.value !== null;
    this.isAdmin = this.currentUserSubject.value?.role?.includes('ROLE_ADMIN');    
  }

  login(email: string, password: string) {
    // body to sent
    let entity = {email,password};

    // set headers of login petition
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'text/html, application/xhtml+xml, */*');

    // login petition
    return this.http
      .post<any>(Utils.urls.login, entity, {
        headers: headers,
      })
      .pipe(
        map((response) => {

          let user = response.user
          user.token = response.token

          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));

          this.currentUserSubject.next(user);
          this.setRoles();

          // set return url
          let returnUrl = '/';

          if (localStorage.getItem('returnUrl')) {
            returnUrl = localStorage.getItem('returnUrl')!;

            localStorage.removeItem('returnUrl');
          }

          // response
          return { returnUrl };
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');

    this.currentUserSubject.next(null!);
    this.setRoles();

    this.router.navigate(['/login']);
  }
}
