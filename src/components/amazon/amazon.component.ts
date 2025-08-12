import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  selector: 'app-amazon',
  templateUrl: './amazon.component.html',
  styleUrl: './amazon.component.scss',
})
export class AmazonComponent {

  @Input() amazonWishlistId: string = ''
  @Input() wishlistId: string = ''
  @Input() size: number = 0
  @Input() itemsPerRow: number = 6
  @Input() showMore: boolean = false

  public loading = true
  public isLogged = false
  public uuidList: string = ''
  public list: any = []

  constructor(
    private apiService: ApiService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production
    this.isLogged = this.authenticationService.isLogged

    if (production && this.wishlistId) {
      this.getAmazon()
    }
  }

  getAmazon(refresh = false) {
    this.loading = true
    let refreshUrl = refresh ? '/refresh/' : '/'
    let filters = this.size > 0 ? '?size=' + this.size : ''

    let url = Utils.urls.amazon + refreshUrl + this.wishlistId + filters

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.list = value.list ?? []
        this.uuidList = value.uuid
        this.loading = false
      },
      error: () => {
        this.loading = false
      }
    })
  }

  refresh() {
    this.getAmazon(true)
  }

  reserveGame(id: number) {
    this.apiService.save(Utils.urls.amazon, '', id + '/reserve').subscribe({
      next: (value: any) => {

        this.list
          .find((product: any) => product.id == id).is_reserved = value.product.is_reserved

      }
    })
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
