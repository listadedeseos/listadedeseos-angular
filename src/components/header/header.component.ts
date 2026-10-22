import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';


@Component({
  selector: 'app-header',
  imports: [
    FontAwesomeModule,
    RouterModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {

  public isLogged = false
  public username = ''
  public fullname = ''
  public isAdmin = false

  // Suggestions still to handle, shown on the "Lista de sugerencias" admin item
  public contactCounts = { pending: 0, in_progress: 0 }

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
    private	authenticationService: AuthenticationService,
    private apiService: ApiService,
  ) {
    this.isLogged = this.authenticationService.isLogged
    this.isAdmin = this.authenticationService.isAdmin

    let currentUser = this.authenticationService.currentUserValue
    if (currentUser) {
      this.username = currentUser.username
      this.fullname = currentUser.fullName
    }

    this.loadContactCounts()
  }

  // The header lives across navigations, so this also runs each time the dropdown is opened
  loadContactCounts() {
    if (!this.isAdmin) return

    // limit=1: only the per-status `counts` of the response are needed
    this.apiService.getPetition(Utils.urls.contact, '?page=1&limit=1').subscribe({
      next: (value: any) => {
        this.contactCounts = {
          pending: value.counts?.pending ?? 0,
          in_progress: value.counts?.in_progress ?? 0,
        }
      },
    })
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
