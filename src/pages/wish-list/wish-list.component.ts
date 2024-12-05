import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
})
export class WishListComponent {

  public username = ''
  private wishListName = ''
  public isLogged = false
  public allWishList:any = []
  public wishlist:any = []

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService
    ) {
      
      this.username = this.activateRoute.snapshot.params['username']??null
      this.wishListName = this.activateRoute.snapshot.params['wishListName']??null
      this.isLogged = this.authenticationService.isLogged

      if(this.isLogged && this.username == null){
        this.username = this.authenticationService.currentUserValue.username        
      }
      
    }

    ngOnInit(){
      this.isLogged && this.getAllWishList()
      this.getWishList()
    }

    getAllWishList(){
      this.apiService.getPetition(Utils.urls.wishlist).subscribe({
        next: (value: any) => {
          this.allWishList = value.wishlists
        },
      })
    }

    getWishList(){
      let url = Utils.urls.wishlist + '/' + this.username + '/' + this.wishListName
      this.apiService.getPetition(url).subscribe({
        next: (value: any) => {
          this.wishlist = value.wishList[0]
        },
      })
    }
}
