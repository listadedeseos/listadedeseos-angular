import { Component } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './amazon.component.html',
  styleUrl: './amazon.component.scss',
})
export class AmazonPage {

  public loading = true
  public uuid = ''
  public wishlist: any = []

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
  ) {
    this.uuid = this.activateRoute.snapshot.params['uuid'] ?? null
  }

  ngOnInit() {
    this.getWishList()
  }

  getWishList() {
    this.loading = true


    this.apiService.getPetition(Utils.urls.wishlist + '/uuid/' + this.uuid).subscribe({
      next: (value: any) => {

        if (value.wishlist) {
          this.wishlist = value.wishlist
        }

      },
      complete: () => {
        this.loading = false
      }
    })
  }

}
