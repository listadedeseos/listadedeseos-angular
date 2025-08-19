import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { Utils } from '../../utils/utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { RouterModule } from '@angular/router';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FontAwesomeModule,
    CommonModule,
    CardComponent,
    RouterModule,
  ],
})
export class DashboardComponent {

  public steamList: any[] = []
  public amazonList: any[] = []
  public isLogged = false

  constructor(
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) { 
    this.isLogged = this.authenticationService.isLogged
    console.log('DashboardComponent constructor - steamList:', this.steamList)
  }

  ngOnInit() {
    console.log('ngOnInit called - steamList:', this.steamList)
    this.getSteam()
    this.getAmazon()
  }

  getSteam() {
    console.log('getSteam called - before request steamList:', this.steamList)
    let url = Utils.urls.steam + '/top'
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        console.log('Steam API response:', value)
        // Force array creation with spread operator
        this.steamList = [...(Array.isArray(value.list) ? value.list : [])]
        console.log('Steam List updated:', this.steamList)
        console.log('Steam List length:', this.steamList.length)
        // Mark for check and detect changes
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error loading steam products:', error);
        this.steamList = []
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      }
    })
  }

  getAmazon() {
    // Si hay endpoint para Amazon, descomenta esto:
    // let url = Utils.urls.amazon + '/top'
    // this.apiService.getPetition(url).subscribe({
    //   next: (value: any) => {
    //     this.amazonList = [...(Array.isArray(value.list) ? value.list : [])]
    //     this.cdr.detectChanges()
    //   },
    //   error: () => {
    //     this.amazonList = []
    //     this.cdr.detectChanges()
    //   }
    // })
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
