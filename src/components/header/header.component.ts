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

  public isAdmin = false

  constructor(
    private router: Router,
    private	authenticationService: AuthenticationService
  ) {
    this.isLogged = this.authenticationService.isLogged
    this.isAdmin = this.authenticationService.isAdmin
  }

  logout(){
    localStorage.removeItem('currentUser')
    this.router.navigate(['/login'])
  }
}
