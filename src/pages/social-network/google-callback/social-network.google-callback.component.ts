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
        data.user.token = data.token;
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        this.router.navigate([sessionStorage.getItem('returnUrl') ?? '/']);
      },
      error: (error: any) => {
        this.router.navigate(['/login']);
      },

    })

  }
}
