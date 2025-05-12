import { Component } from '@angular/core';
import { Utils } from '../../utils/utils';

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
