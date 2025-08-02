import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';

@Component({
  selector: 'app-custom-table',
  templateUrl: './customTable.component.html',
})
export class CustomTableComponent {

  @Input() url?: string;
  @Input() headers?: { name: string, key: string | string[], subKey?: string, type?: string, innerHtml?: boolean, headers?: any }[];
  @Output() editEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  loading = false

  @Input() items: any = [];

  total: number[] = []

  page = 1

  @Input() limit = 10


  // formatEuro = Utils.formatEuro;

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit() {
    if (this.url) {
      this.getItems();
    }
  }

  getItems() {
    this.loading = true;
    this.apiService.getPetition(this.url + '?page=' + this.page + '&limit=' + this.limit).subscribe({
      next: (data: any) => {
        this.items = data.list;

        this.total = []
        for (let i = 0; i < data.total / this.limit; i++) {
          this.total.push(i + 1)
        }

      },
      error: (error: any) => {
        console.error('ERROR obtener productos. ' + error);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getValue(item: any, key: string | string[]) {

    let arrayKey = [];

    if (!Array.isArray(key)) {
      arrayKey.push(key);
    } else {
      arrayKey = key.slice();
    }

    let result = ''

    while (arrayKey.length > 0) {

      let keys = arrayKey[0].split('.');
      let value = item;

      if (keys[0].includes('[]')) {
        let arrayKey = keys[0].replace('[]', '');

        value = value[arrayKey].map((element: any) => this.getValue(element, keys.slice(1).join('.'))).join(', ');

      } else {
        for (let i = 0; value && i < keys.length; i++) {
          value = value[keys[i]];
        }
      }

      arrayKey.shift();

      result += (value ?? '') + (arrayKey.length > 0 ? ' ' : '');

    }

    return result;
  }

  isArray(array: any): boolean {
    return Array.isArray(array)
  }

  changePage(page: number) {
    this.page = page
    this.getItems()
  }

  clickEditButton(id?: number) {
    this.editEvent.emit(id)
  }

  clickDeleteButton(id?: number) {
    this.deleteEvent.emit(id);
  }

}
