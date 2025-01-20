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
  public username = ''
  private wishListName = ''
  public isLogged = false
  public allWishList: any = []
  public wishlist: any = []
  public wishListId = 0
  public modalProductOpen = false
  public modalWishListOpen = false
  public wishListFormId = 0
  public routeSubsrciption: any

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
  ) {
    this.refreshData()
  }

  refreshData() {
    this.username = this.activateRoute.snapshot.params['username'] ?? null
    this.wishListName = this.activateRoute.snapshot.params['wishListName'] ?? null
    this.isLogged = this.authenticationService.isLogged

    if (this.isLogged && this.username == null) {
      this.username = this.authenticationService.currentUserValue.username
    }
  }

  ngOnInit() {
    this.isLogged && this.getAllWishList()

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
    let wishListName = ''
    if (this.wishListName && this.wishListName != 'null') {
      wishListName = '/' + this.wishListName
    }
    return 'https://listadedeseos.es/' + this.username + wishListName
  }

  getAllWishList() {
    this.apiService.getPetition(Utils.urls.wishlist).subscribe({
      next: (value: any) => {
        this.allWishList = value.wishlists
      },
    })
  }

  getWishList() {
    this.loading = true
    let url = Utils.urls.wishlist + '/' + this.username + '/' + this.wishListName
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.wishListId = value.wishList[0]?.id
        this.wishlist = value.wishList[0] ?? []
      },
      complete: () => {
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

  toggleModalWishList(wishListFormId = 0) {
    this.wishListFormId = wishListFormId    
    this.modalWishListOpen = !this.modalWishListOpen
  }

  wishlistUpdate(id: number, response: any) {
    if (id == 0) {
      this.allWishList.push(response.wishList)
    }
  }
}
