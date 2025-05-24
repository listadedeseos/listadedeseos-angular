import { Component } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

  public steamList: any = []

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.getSteam()
  }

  getSteam() {
    let url = Utils.urls.steam + '/top'
    this.apiService.getPetition(url).subscribe({
      next: (value: any) => {
        this.steamList = value.list ?? []
      },
      error: () => {
        this.steamList = []
      }
    })
  }

}
