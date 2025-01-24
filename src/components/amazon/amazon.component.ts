import { Component, Input, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';

@Component({
  selector: 'app-amazon',
  templateUrl: './amazon.component.html',
  styleUrl: './amazon.component.scss',
})
export class AmazonComponent {

  @Input() username: string = ''

  public loading = true
  public list: any = []

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production

    if (production && this.username) {
      this.getAmazon()
    }
  }

  getAmazon() {
    this.loading = true
    let url = Utils.urls.amazon + '/' + this.username
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
