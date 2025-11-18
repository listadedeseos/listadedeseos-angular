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
import { DatePipe } from '@angular/common';

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
    DatePipe,
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
  public editingProductId: number | null = null
  public modalWishListOpen = false
  public wishListFormId = 0
  public routeSubsrciption: any
  public isMainWishlist = false

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
    this.wishListName = this.activateRoute.snapshot.params['wishListName'] ?? null
    this.isLogged = this.authenticationService.isLogged

    if (this.isLogged && !this.uuid && !this.username) {
      this.getAllWishList(true)
    }

    this.cdr.markForCheck()
  }

  ngOnInit() {
    this.routeSubsrciption = this.activateRoute.params.subscribe(params => {
      this.refreshData()
      if (this.uuid || this.username) {
        this.getWishList()
      }
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

  getAllWishList(getWishList = false) {
    if (this.allWishList.length == 0) {
      this.apiService.getPetition(Utils.urls.wishlist).subscribe({
        next: (value: any) => {
          this.allWishList = [...(Array.isArray(value.wishlists) ? value.wishlists : [])]

          this.allWishList = this.allWishList.map((wishList: any) => {
            wishList.isMain = wishList.id == value.main_wish_list_id
            return wishList
          })

          if (this.uuid == null) {
            this.uuid = this.allWishList[0]?.uuid
            if (getWishList) {
              this.getWishList()
            }
          }

          this.cdr.markForCheck()
          this.cdr.detectChanges()
        },
      })
    }
  }

  getWishList() {
    this.loading = true
    this.cdr.detectChanges()

    let url = this.uuid ?
      Utils.urls.wishlist + '/uuid/' + this.uuid :
      Utils.urls.wishlist + '/' + this.username + (this.wishListName ? '/' + this.wishListName : '')

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {

        if (value.wishlist) {
          this.wishListId = value.wishlist.id
          this.wishlist = { ...value.wishlist }

          this.dateCounter(this.wishlist.date_end)
        }

        this.isMainWishlist = value.isMain
        this.urlToShare = '@' + value.username + (this.isMainWishlist ? '' : '/' + this.wishlist.name)

        if (this.isLogged && value.username == this.authenticationService.currentUserValue.username) {
          this.isMyWishList = true
          this.getAllWishList()
        }

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

    this.apiService.deleteById(Utils.urls.wishlist, id).subscribe({
      next: (value: any) => {
        this.allWishList = [...this.allWishList.filter((wishList: any) => wishList.id != id)]
        this.loading = false

        if (this.uuid == value.wishList.uuid) {

          let mainUuid = this.allWishList.find((wishList: any) => wishList.isMain)?.uuid

          this.router.navigateByUrl('/list/' + (mainUuid ? mainUuid : ''));
        }

        Utils.ToastUtils.success('Lista eliminada', 'La lista de deseos ha sido eliminada correctamente')

        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      error: () => {
        Utils.ToastUtils.error('Error', 'No se ha podido eliminar la lista de deseos')
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  urlCopied() {
    Utils.ToastUtils.success('Enlace copiado', 'El enlace de la lista de deseos ha sido copiado al portapapeles');
  }

  toggleModalProduct() {
    this.modalProductOpen = !this.modalProductOpen
    this.editingProductId = null
    this.cdr.detectChanges()
  }

  toggleShowReserveButtons() {
    CardComponent.showReserveButton = !CardComponent.showReserveButton;
    this.showReserveButton = CardComponent.showReserveButton;
    this.cdr.detectChanges()
  }

  productUpdate(response: any, id: number = 0) {
    if (id != 0) { // Update product
      const index = this.wishlist.products.findIndex((product: any) => product.id == id)
      this.wishlist.products[index] = { ...this.wishlist.products[index], ...response.product }

    } else {
      this.wishlist.products = [...(this.wishlist.products || []), response.product]
    }

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

  editProduct(id: number) {
    this.editingProductId = id
    this.modalProductOpen = true
  }

  toggleModalWishList(wishListFormId = 0) {
    this.wishListFormId = wishListFormId
    this.modalWishListOpen = !this.modalWishListOpen
    this.cdr.detectChanges()
  }

  wishlistUpdate(id: number, response: any) {

    if (id == 0) { // New wish list
      response.wishList.is_new = true // To show animation
      this.allWishList = [...this.allWishList, response.wishList]

    } else { // Update wish list
      const index = this.allWishList.findIndex((wishList: any) => wishList.id == id)
      if (index > -1) {
        this.allWishList[index] = { ...this.allWishList[index], ...response.wishList }
      }
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

  dateCounter(dateEnd: string) {

    if (dateEnd) {

      this.calculateDateEndCounter(dateEnd);

      setInterval(() => {
        this.calculateDateEndCounter(dateEnd);
      }, 1000);

    }

  }

  calculateDateEndCounter(dateEnd: string) {
    const now = new Date();
    const endDate = new Date(dateEnd);
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      this.wishlist.date_end_counter = 'Finalizado';
      this.cdr.detectChanges();
      return;
    }

    // Calculate all time units
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Build the counter string
    let counterParts = [];

    if (days > 0) {
      counterParts.push(`${days} día${days !== 1 ? 's' : ''}`);
    }

    // Always show hours, minutes, and seconds
    counterParts.push(`${hours.toString().padStart(2, '0')}h`);
    counterParts.push(`${minutes.toString().padStart(2, '0')}m`);
    counterParts.push(`${seconds.toString().padStart(2, '0')}s`);

    this.wishlist.date_end_counter = counterParts.join(' ');

    this.cdr.detectChanges()
  }

}
