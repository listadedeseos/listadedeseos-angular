import { Component, Input } from '@angular/core';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';

@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrl: './steam.component.scss',
})
export class SteamComponent {

  @Input() username: string = ''
  public list: any = []

  constructor(
    private apiService: ApiService,
  ) {
  }

  ngOnInit() {
    this.getSteam()
  }

  getSteam() {
    let url = Utils.urls.steam + '/' + this.username
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.list = value.list ?? []
      }
    })
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
  }

}
