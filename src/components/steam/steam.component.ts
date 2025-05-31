import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';

@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrl: './steam.component.scss',
})
export class SteamComponent {

  @Input() wishlistId: number = 0
  @Input() username: string = ''
  @Input() size: number = 0
  @Input() showMore: boolean = false
  @Input() itemsPerRow: number = 6

  public loading = true
  public isLogged = false
  public list: any = []
  public uuidList: string = ''

  constructor(
    private authenticationService: AuthenticationService,
    private apiService: ApiService,
  ) {
    this.isLogged = this.authenticationService.isLogged
  }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production

    if (production && this.username) {
      this.getSteam()
    }
  }

  getSteam(refresh = false) {
    this.loading = true

    let refreshUrl = refresh ? '/refresh/' : '/'
    let filters = this.size > 0 ? '?size=' + this.size : ''

    let url = Utils.urls.steam + refreshUrl + this.wishlistId + filters

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.list = value.list ?? []
        this.uuidList = value.uuid ?? ''
        this.loading = false
      },
      error: () => {
        this.loading = false
      }
    })
  }

  refresh() {
    this.getSteam(true)
  }

  reserveGame(id: number) {
    this.apiService.save(Utils.urls.steam, '', id + '/reserve').subscribe({
      next: (value: any) => {

        this.list
          .find((game: any) => game.id == id).is_reserved = value.product.is_reserved

      }
    })
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
