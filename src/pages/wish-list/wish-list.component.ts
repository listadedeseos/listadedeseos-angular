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

  public loading = true
  private uuid = ''
  public username = ''
  private wishListName = ''
  public isLogged = false
  public allWishList: any = []
  public isMyWishList = false
  public wishlist: any = []
  public wishListId = 0
  public modalProductOpen = false
  public modalWishListOpen = false
  public wishListFormId = 0
  public routeSubsrciption: any

  public urlToShare = ''

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
  ) {
  }

  refreshData() {
    this.uuid = this.activateRoute.snapshot.params['uuid'] ?? null
    this.username = this.activateRoute.snapshot.params['username'] ?? null
    this.wishListName = this.activateRoute.snapshot.params['wishListName'] ?? 'principal'
    this.isLogged = this.authenticationService.isLogged

    if (this.isLogged && this.username == null) {
      this.username = this.authenticationService.currentUserValue.username
      this.isMyWishList = true
      this.getAllWishList()
    }
  }

  ngOnInit() {
    this.routeSubsrciption = this.route.params.subscribe(params => {
      this.refreshData()
      this.getWishList()
    });
  }

  ngOnDestroy() {
    this.routeSubsrciption.unsubscribe()
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

  getwishListUrl() {
    return 'https://listadedeseos.es/' + this.urlToShare
  }

  getAllWishList() {
    this.apiService.getPetition(Utils.urls.wishlist).subscribe({
      next: (value: any) => {
        this.allWishList = value.wishlists

        if (this.uuid == null) {
          this.uuid = this.allWishList[0]?.uuid
          this.getWishList()
        }

      },
    })
  }

  getWishList() {
    this.loading = true

    let url = this.uuid ?
      Utils.urls.wishlist + '/uuid/' + this.uuid :
      Utils.urls.wishlist + '/' + this.username + '/' + this.wishListName

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {

        let wishListName = ''
        if (value.wishlist) {
          this.wishListId = value.wishlist.id
          this.wishlist = value.wishlist
          wishListName = this.wishlist.name.toLowerCase() != 'principal' ? this.wishlist.name : ''
        }

        this.urlToShare = '@' + value.username + (wishListName ? '/' + wishListName : '')
      },
      complete: () => {
        this.loading = false
      }
    })
  }

  deleteWishList(id: number) {
    this.loading = true
    this.apiService.deleteById(Utils.urls.wishlist, id).subscribe({
      next: (value: any) => {
        this.allWishList = this.allWishList.filter((wishList: any) => wishList.id != id)
        this.loading = false
      }
    })
  }

  toggleModalProduct() {
    this.modalProductOpen = !this.modalProductOpen
  }

  productUpdate(response: any) {
    this.wishlist.products.push(response.product)
  }

  reserveProduct(id: number) {
    this.apiService.save(Utils.urls.product, '', id + '/reserve').subscribe({
      next: (value: any) => {

        this.wishlist.products
          .find((product: any) => product.id == id).is_reserved = value.product.is_reserved

      }
    })
  }

  toggleModalWishList(wishListFormId = 0) {
    this.wishListFormId = wishListFormId
    this.modalWishListOpen = !this.modalWishListOpen
  }

  wishlistUpdate(id: number, response: any) {
    if (id == 0) {
      response.wishList.is_new = true // To show animation
      this.allWishList.push(response.wishList)
    }
  }
}
