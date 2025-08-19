import { Component, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../apiConnection/ApiService';
import { Utils } from '../../../utils/utils';
import { CustomTableComponent } from '../../../components/customTable/customTable.component';
import { CustomDeleteComponent } from '../../../components/customDelete/customDelete.component';

@Component({
    imports: [
        CustomTableComponent,
        CustomDeleteComponent,
    ],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ContactListComponent {

    loading: boolean = true;

    public url = Utils.urls.contact
    public headers = [
        { name: 'ID', key: 'id' },
        { name: 'TIPO', key: 'type' },
        { name: 'NOMBRE', key: 'name' },
        { name: 'TÍTULO', key: 'title' },
        { name: 'HECHO', key: 'is_done', type: 'boolean' },
        { name: 'FECHA', key: 'created_at', type: 'dateTime' },
    ]

    public id = 0
    public deleteProduct = false

    constructor(private apiService: ApiService) { }

    toogleDeleteForm(id = 0) {
        this.id = id
        this.deleteProduct = !this.deleteProduct
    }
}