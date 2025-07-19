import { Component } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { Utils } from '../../utils/utils';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

  public steamList: any = []
  public amazonList: any = []
  public isLogged = false

  constructor(
    private apiService: ApiService,
    private authenticationService: AuthenticationService
  ) { 
    this.isLogged = this.authenticationService.isLogged
  }

  ngOnInit() {
    this.getSteam()
    this.getAmazon()
  }

  getSteam() {
    let url = Utils.urls.steam + '/top'
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.steamList = value.list ?? []
      },
      error: () => {
        this.steamList = []
      }
    })
  }

  getAmazon() {
    // Si hay endpoint para Amazon, descomenta esto:
    // let url = Utils.urls.amazon + '/top'
    // this.apiService.getPetition(url).subscribe({
    //   next: (value: any) => {
    //     this.amazonList = value.list ?? []
    //   },
    //   error: () => {
    //     this.amazonList = []
    //   }
    // })
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
