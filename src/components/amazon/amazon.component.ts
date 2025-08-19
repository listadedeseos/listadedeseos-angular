import { Component, Input, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Utils } from '../../utils/utils';
import { ApiService } from '../../apiConnection/ApiService';
import { AuthenticationService } from '../../apiConnection/authentication.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amazon',
  imports: [
    FontAwesomeModule,
    RouterModule,
    CardComponent,
    CommonModule,
],
  templateUrl: './amazon.component.html',
  styleUrl: './amazon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isLogged = this.authenticationService.isLogged
    console.log('AmazonComponent ngOnInit - list:', this.list)
  }

  ngOnChanges(changes: SimpleChanges) {
    let production = environment.production
    this.isLogged = this.authenticationService.isLogged

    console.log('AmazonComponent ngOnChanges - wishlistId:', this.wishlistId)

    if (production && this.wishlistId) {
      this.getAmazon()
    }
  }

  getAmazon(refresh = false) {
    this.loading = true
    this.cdr.detectChanges()
    
    console.log('getAmazon called - before request list:', this.list)
    let refreshUrl = refresh ? '/refresh/' : '/'
    let filters = this.size > 0 ? '?size=' + this.size : ''

    let url = Utils.urls.amazon + refreshUrl + this.wishlistId + filters

    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        console.log('Amazon API response:', value)
        // Force array creation with spread operator
        this.list = [...(Array.isArray(value.list) ? value.list : [])]
        this.uuidList = value.uuid || ''
        this.loading = false
        console.log('Amazon List updated:', this.list)
        console.log('Amazon List length:', this.list.length)
        // Mark for check and detect changes
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('Error loading amazon products:', error)
        this.loading = false
        this.list = []
        this.cdr.markForCheck()
        this.cdr.detectChanges()
      }
    })
  }

  refresh() {
    this.getAmazon(true)
  }

  reserveGame(id: number) {
    this.apiService.save(Utils.urls.amazon, '', id + '/reserve').subscribe({
      next: (value: any) => {
        const product = this.list.find((product: any) => product.id == id)
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
