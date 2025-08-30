import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { CustomTableComponent } from '../../components/customTable/customTable.component';
import { CustomDeleteComponent } from '../../components/customDelete/customDelete.component';

@Component({
    imports: [
        CustomTableComponent,
        CustomDeleteComponent,
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class UserComponent {

    @ViewChild('customTable') customTable!: CustomTableComponent;

    loading: boolean = true;

    public url = Utils.urls.user
    public headers = [
        { name: 'ID', key: 'id' },
        { name: 'LOGIN', key: 'key', type: 'login' },
        { name: 'NOMBRE', key: ['name', 'surname'], subKey: 'username' },
        { name: 'CORREO ELECTRÓNICO', key: 'email' },
        {
            name: 'LISTAS', key: 'wish_lists', type: 'table', headers: [
                { name: 'URL', key: 'uuid', linkName: 'Abrir lista', url: '/list/{key}', type: 'link' },
                { name: 'UUID', key: 'uuid' },
                { name: 'NAME', key: 'name' },
                { name: 'STEAM', key: 'steam_username' },
                { name: 'AMAZON', key: 'amazon_wishlist_id' },
                { name: 'ACTUALIZADO', key: 'updated_at', subKey: 'created_at', type: 'dateTime' },
            ]
        },
        { name: 'ACTUALIZADO', key: 'updated_at', subKey: 'created_at', type: 'dateTime' },
    ]

    public id = 0
    public deleteProduct = false

    constructor(private apiService: ApiService) { }

    toogleDeleteForm(id = 0) {
        this.id = id
        this.deleteProduct = !this.deleteProduct
    }
}