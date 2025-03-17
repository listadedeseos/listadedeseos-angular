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

  public loading = true
  public isLogged = false
  public list: any = []

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
    let url = Utils.urls.steam + refreshUrl + this.wishlistId
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.list = value.list ?? []
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

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
