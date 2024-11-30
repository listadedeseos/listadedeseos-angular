import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.scss',
})
export class WishListComponent {

  private username = ''
  private wishListName = ''
  public wishlist:any = []

  constructor(
    private router: Router,
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    ) {
      this.username = this.activateRoute.snapshot.params['username']
      this.wishListName = this.activateRoute.snapshot.params['wishListName']??null
    }

    ngOnInit(){
      this.getWishList()
    }

    getWishList(){
      let url = Utils.urls.wishlist + '/' + this.username + '/' + this.wishListName
      this.apiService.getPetition(url).subscribe({
        next: (value: any) => {
          this.wishlist = value.wishList[0]
        },
      })
    }
}
