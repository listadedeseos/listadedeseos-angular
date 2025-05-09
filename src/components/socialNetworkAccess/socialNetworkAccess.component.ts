import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  selector: 'app-social-network-access',
  templateUrl: './socialNetworkAccess.component.html',
  styleUrl: './socialNetworkAccess.component.scss',
})
export class SocialNetworkAccessComponent {

  loginWithGoogle() {
    const url = Utils.urls.loginGoogle
    window.open(url, '_self')
  }

  loginWithFacebook() {
    const url = Utils.base + 'login-facebook'
    window.open(url, '_self')
  }
}
