import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardComponent } from '../../components/card/card.component';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SteamComponent } from '../../components/steam/steam.component';

@Component({
  imports: [
    RouterModule,
    FontAwesomeModule,
    SteamComponent,
  ],
  templateUrl: './steam.component.html',
  styleUrl: './steam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SteamPage {

  public loading = true
  public uuid = ''
  public isLogged = false;
  public showReserveButton = CardComponent.showReserveButton;
  public wishlist: any = []

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) {
    this.uuid = this.activateRoute.snapshot.params['uuid'] ?? null
    this.isLogged = this.authenticationService.isLogged
    console.log('SteamPage constructor - uuid:', this.uuid)
  }

  ngOnInit() {
    console.log('SteamPage ngOnInit - wishlist:', this.wishlist)
    this.getWishList()
  }

  toggleShowReserveButtons() {
    CardComponent.showReserveButton = !CardComponent.showReserveButton;
    this.showReserveButton = CardComponent.showReserveButton;
    this.cdr.detectChanges()
  }

  getWishList() {
    this.loading = true
    this.cdr.detectChanges()

    console.log('getWishList called - before request wishlist:', this.wishlist)

    this.apiService.getPetition(Utils.urls.wishlist + '/uuid/' + this.uuid).subscribe({
      next: (value: any) => {
        console.log('Steam Page API response:', value)
        
        if (value.wishlist) {
          this.wishlist = { ...value.wishlist }
          console.log('Wishlist updated:', this.wishlist)
        }

        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.wishlist = []
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      complete: () => {
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

}
