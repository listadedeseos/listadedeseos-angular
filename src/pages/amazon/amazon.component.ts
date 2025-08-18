import { Component } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { CardComponent } from '../../components/card/card.component';

@Component({
  templateUrl: './amazon.component.html',
  styleUrl: './amazon.component.scss',
})
export class AmazonPage {

  public loading = true
  public uuid = ''
  public isLogged = false;
  public showReserveButton = CardComponent.showReserveButton;
  public wishlist: any = []

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
    this.uuid = this.activateRoute.snapshot.params['uuid'] ?? null
    this.isLogged = this.authenticationService.isLogged
  }

  ngOnInit() {
    this.getWishList()
  }

  toggleShowReserveButtons() {
    CardComponent.showReserveButton = !CardComponent.showReserveButton;

    this.showReserveButton = CardComponent.showReserveButton;
  }

  getWishList() {
    this.loading = true


    this.apiService.getPetition(Utils.urls.wishlist + '/uuid/' + this.uuid).subscribe({
      next: (value: any) => {

        if (value.wishlist) {
          this.wishlist = value.wishlist
        }

      },
      complete: () => {
        this.loading = false
      }
    })
  }

}
