import { Component, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

@Component({
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class UserComponent {

    loading: boolean = true;

    public url = Utils.urls.user
    public headers = [
        { name: 'ID', key: 'id' },
        { name: 'ACTIVO', key: 'active', type: 'boolean' },
        { name: 'NOMBRE DE USUARIO', key: 'username' },
        { name: 'NOMBRE', key: 'name' },
        { name: 'APELLIDO', key: 'surname' },
        { name: 'CORREO ELECTRÓNICO', key: 'email' },
        { name: 'GOOGLE ID', key: 'google_id' },
        { name: 'ROL', key: 'role' },
        { name: 'CREADO', key: 'created_at', type: 'dateTime' },
        { name: 'ACTUALIZADO', key: 'updated_at', type: 'dateTime' },
    ]

    public id = 0
    public deleteProduct = false

    constructor(private apiService: ApiService) { }

    toogleDeleteForm(id = 0) {
        this.id = id
        this.deleteProduct = !this.deleteProduct
    }
}