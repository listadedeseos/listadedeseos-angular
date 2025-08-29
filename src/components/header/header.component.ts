import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    FontAwesomeModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  public isLogged = false
  public username = ''
  public fullname = ''
  public isAdmin = false

  public adminRouting = [
    {
      url: '/user',
      icon: 'users-cog',
      title: 'Gestión de Usuarios',
      subtitle: 'Administrar usuarios del sistema',
    },
    {
      url: '/contact/list',
      icon: 'comments',
      title: 'Lista de sugerencias',
      subtitle: 'Ver sugerencias',
    },
  ]

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

  getFirstLetter(): string {
    if (this.fullname && this.fullname.length > 0) {
      return this.fullname.charAt(0).toUpperCase();
    } else if (this.username && this.username.length > 0) {
      return this.username.charAt(0).toUpperCase();
    }
    return 'U'; // Default fallback
  }

  logout(){
    localStorage.removeItem('currentUser')
    this.router.navigate(['/login'])
  }
}
