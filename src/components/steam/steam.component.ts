import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';

@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrl: './steam.component.scss',
})
export class SteamComponent {

  @Input() wishlistId: number = 0
  @Input() username: string = ''

  public loading = true
  public list: any = []

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production

    if (production && this.username) {
      this.getSteam()
    }
  }

  getSteam() {
    this.loading = true
    let url = Utils.urls.steam + '/' + this.wishlistId
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

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
