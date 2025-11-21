import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../apiConnection/ApiService';
import { Utils } from '../../../utils/utils';

@Component({
  template: ''
})
export class SocialNetworkGoogleCallbackComponent {

  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.login();
  }

  login() {
    this.apiService.getPetition(Utils.urls.loginGoogleCallback, window.location.search).subscribe({
      next: (data: any) => {

        // save user data and token in local storage
        data.user.token = data.token;
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        // if first time, redirect to profile, else to returnUrl or home
        let returnUrl = data.first_time ? '/profile' : sessionStorage.getItem('returnUrl');
        this.router.navigate([returnUrl ?? '/']);

      },
      error: (error: any) => {
        this.router.navigate(['/login']);
      },

    })

  }
}
