import { Component, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../../apiConnection/ApiService';
import { Utils } from '../../../utils/utils';

@Component({
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ContactListComponent {

    loading: boolean = true;

    public url = Utils.urls.contact
    public headers = [
        { name: 'TIPO', key: 'type' },
        { name: 'NOMBRE', key: 'name' },
        { name: 'CORREO ELECTRÓNICO', key: 'email' },
        { name: 'TÍTULO', key: 'title' },
        { name: 'CUERPO', key: 'body' },
        { name: 'HECHO', key: 'is_done', type: 'boolean' },
    ]

    public id = 0
    public deleteProduct = false

    constructor(private apiService: ApiService) { }

    toogleDeleteForm(id = 0) {
        this.id = id
        this.deleteProduct = !this.deleteProduct
    }
}