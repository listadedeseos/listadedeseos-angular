import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  public isLogged = false
  public username = ''
  public fullname = ''

  public isAdmin = false

  constructor(
    private router: Router,
    private	authenticationService: AuthenticationService
  ) {
    this.isLogged = this.authenticationService.isLogged
    this.isAdmin = this.authenticationService.isAdmin

    let currentUser = this.authenticationService.currentUserValue
    if (currentUser) {
      this.username = currentUser.username
      this.fullname = currentUser.fullName
    }
    
  }

  logout(){
    localStorage.removeItem('currentUser')
    this.router.navigate(['/login'])
  }
}
