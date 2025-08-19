import { Component, Input, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-steam',
  imports: [
    FontAwesomeModule,
    CommonModule,
    RouterModule,
    CardComponent,
  ],
  templateUrl: './steam.component.html',
  styleUrl: './steam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private cdr: ChangeDetectorRef
  ) {
    this.isLogged = this.authenticationService.isLogged
  }

  ngOnInit() {
    this.isLogged = this.authenticationService.isLogged
    console.log('SteamComponent ngOnInit - list:', this.list)
  }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production

    console.log('SteamComponent ngOnChanges - username:', this.username)

    if (production && this.username) {
      this.getSteam()
    }
  }

  getSteam(refresh = false) {
    this.loading = true
    this.cdr.detectChanges()

    console.log('getSteam called - before request list:', this.list)
    let refreshUrl = refresh ? '/refresh/' : '/'
    let filters = this.size > 0 ? '?size=' + this.size : ''

    let url = Utils.urls.steam + refreshUrl + this.wishlistId + filters

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        console.log('Steam API response:', value)
        // Force array creation with spread operator
        this.list = [...(Array.isArray(value.list) ? value.list : [])]
        this.uuidList = value.uuid ?? ''
        this.loading = false
        console.log('Steam List updated:', this.list)
        console.log('Steam List length:', this.list.length)
        // Mark for check and detect changes
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error loading steam products:', error)
        this.loading = false
        this.list = []
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      }
    })
  }

  refresh() {
    this.getSteam(true)
  }

  reserveGame(id: number) {
    this.apiService.save(Utils.urls.steam, '', id + '/reserve').subscribe({
      next: (value: any) => {
        const product = this.list.find((game: any) => game.id == id)
        if (product) {
          product.is_reserved = value.product.is_reserved
          this.cdr.markForCheck()
          this.cdr.detectChanges()
        }
      }
    })
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/empty.webp';
    this.cdr.detectChanges();
  }

}
