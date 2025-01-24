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
        { name: 'NOMBRE', key: 'name' },
        { name: 'CORREO ELECTRÓNICO', key: 'email' },
        { name: 'ROL', key: 'role' },
        { name: 'CREADO', key: 'created_at', type: 'dateTime' },
        { name: 'ACTUALIZADO', key: 'updated_at', type: 'dateTime' },
    ]

    constructor(private apiService: ApiService) { }

}