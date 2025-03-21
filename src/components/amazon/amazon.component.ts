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

  public loading = true
  public isLogged = false
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
    let url = Utils.urls.amazon + refreshUrl + this.wishlistId
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
    this.getAmazon(true)
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
