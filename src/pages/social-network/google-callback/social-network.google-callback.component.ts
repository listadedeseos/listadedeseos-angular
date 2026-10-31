import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../apiConnection/ApiService';
import { AuthenticationService } from '../../../apiConnection/authentication.service';
import { Utils } from '../../../utils/utils';

@Component({
  template: ''
})
export class SocialNetworkGoogleCallbackComponent {

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.login();
  }

  login() {
    this.apiService.getPetition(Utils.urls.loginGoogleCallback, window.location.search).subscribe({
      next: (data: any) => {

        this.authenticationService.setSession(data.user, data.token);

        // if first time, redirect to profile, else to returnUrl or home
        let returnUrl = this.authenticationService.consumeReturnUrl();
        this.router.navigate([data.first_time ? '/profile' : returnUrl]);

      },
      error: (error: any) => {
        this.router.navigate(['/login']);
      },

    })

  }
}
