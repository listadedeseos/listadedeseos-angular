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
  public wishListId = 0
  public modalProductOpen = false

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
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

    getwishListUrl() {
      let wishListName = ''
      if(this.wishListName && this.wishListName != 'null'){
        wishListName = '/' + this.wishListName
      }
      return 'listadedeseos.es/' + this.username + wishListName
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
          this.wishListId = value.wishList[0].id
          this.wishlist = value.wishList[0]
        },
      })
    }

    toggleModalProduct() {    
      this.modalProductOpen = !this.modalProductOpen
    }
}
