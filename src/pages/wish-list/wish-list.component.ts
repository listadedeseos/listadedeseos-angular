import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { CardComponent } from '../../components/card/card.component';
import { ThemeConfig } from '../../enum/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SteamComponent } from '../../components/steam/steam.component';
import { AmazonComponent } from '../../components/amazon/amazon.component';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { WishlistFormComponent } from '../../components/wishlist-form/wishlist-form.component';

@Component({
  imports: [
    RouterModule,
    FontAwesomeModule,
    ClipboardModule,
    CardComponent,
    SteamComponent,
    AmazonComponent,
    ProductFormComponent,
    WishlistFormComponent,
  ],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  public showReserveButton = CardComponent.showReserveButton;

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
    
    this.cdr.markForCheck()
  }

  ngOnInit() {
    this.routeSubsrciption = this.activateRoute.params.subscribe(params => {
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
    this.cdr.detectChanges();
  }

  getwishListUrl() {
    return 'https://listadedeseos.es/' + this.urlToShare
  }

  getAllWishList() {
    this.apiService.getPetition(Utils.urls.wishlist).subscribe({
      next: (value: any) => {
        this.allWishList = [...(Array.isArray(value.wishlists) ? value.wishlists : [])]

        if (this.uuid == null) {
          this.uuid = this.allWishList[0]?.uuid
          this.getWishList()
        }

        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
    })
  }

  getWishList() {
    this.loading = true
    this.cdr.detectChanges()

    let url = this.uuid ?
      Utils.urls.wishlist + '/uuid/' + this.uuid :
      Utils.urls.wishlist + '/' + this.username + '/' + this.wishListName

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {

        let wishListName = ''
        if (value.wishlist) {
          this.wishListId = value.wishlist.id
          this.wishlist = { ...value.wishlist }
          wishListName = this.wishlist.name.toLowerCase() != 'principal' ? this.wishlist.name : ''
        }

        this.urlToShare = '@' + value.username + (wishListName ? '/' + wishListName : '')
        
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },

      error: () => {
        // redirect to first wish list if not found
        if (this.allWishList.length > 0) {
          this.uuid = this.allWishList[0].uuid
          this.getWishList()

        } else {
          // redirect to dashboard if no wish lists
          this.router.navigateByUrl('/', {
            replaceUrl: true
          });
        }
      },

      complete: () => {
        this.loading = false
        this.cdr.detectChanges()
      }

    })
  }

  deleteWishList(id: number) {
    this.loading = true
    this.cdr.detectChanges()
    
    this.apiService.deleteById(Utils.urls.wishlist, id).subscribe({
      next: (value: any) => {
        this.allWishList = [...this.allWishList.filter((wishList: any) => wishList.id != id)]
        this.loading = false
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      }
    })
  }

  urlCopied() {
    Utils.ToastUtils.success('Enlace copiado', 'El enlace de la lista de deseos ha sido copiado al portapapeles');
  }

  toggleModalProduct() {
    this.modalProductOpen = !this.modalProductOpen
    this.cdr.detectChanges()
  }

  toggleShowReserveButtons() {
    CardComponent.showReserveButton = !CardComponent.showReserveButton;
    this.showReserveButton = CardComponent.showReserveButton;
    this.cdr.detectChanges()
  }

  productUpdate(response: any) {
    this.wishlist.products = [...(this.wishlist.products || []), response.product]
    this.cdr.markForCheck()
    this.cdr.detectChanges()
  }

  reserveProduct(id: number) {
    this.apiService.save(Utils.urls.product, '', id + '/reserve').subscribe({
      next: (value: any) => {

        const product = this.wishlist.products.find((product: any) => product.id == id)
        if (product) {
          product.is_reserved = value.product.is_reserved
          this.cdr.markForCheck()
          this.cdr.detectChanges()
        }

      }
    })
  }

  toggleModalWishList(wishListFormId = 0) {
    this.wishListFormId = wishListFormId
    this.modalWishListOpen = !this.modalWishListOpen
    this.cdr.detectChanges()
  }

  wishlistUpdate(id: number, response: any) {
    if (id == 0) {
      response.wishList.is_new = true // To show animation
      this.allWishList = [...this.allWishList, response.wishList]
      this.cdr.markForCheck()
      this.cdr.detectChanges()
    }
  }

  getThemeLabel(theme: string): string {
    return ThemeConfig.getTheme(theme).label;
  }

  getThemeClasses(theme: string): string {
    return ThemeConfig.getThemeClasses(theme);
  }

  getHeroClasses(theme: string): string {
    return ThemeConfig.getHeroClasses(theme);
  }

  getThemeOverlay(theme: string): string {
    return ThemeConfig.getTheme(theme).overlayClasses;
  }

  getThemeSubtitle(theme: string): string {
    return ThemeConfig.getTheme(theme).subtitle;
  }

  getPageBackgroundClasses(theme: string): string {
    return ThemeConfig.getPageClasses(theme);
  }

  getBannerImage(theme: string): string {
    return ThemeConfig.getTheme(theme).banner;
  }
}
