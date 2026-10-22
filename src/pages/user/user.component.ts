import { Component, ViewEncapsulation, ViewChild, inject } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { CustomDeleteComponent } from '../../components/customDelete/customDelete.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { SAUTableModule } from '@some-angular-utils/table';
import { SAUModalService } from '@some-angular-utils/modal';

@Component({
    imports: [
        SAUTableModule,
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class UserComponent {

    @ViewChild('customTable') customTable!: SAUTableModule;

    private sauModalService = inject(SAUModalService);

    loading: boolean = true;

    public url = Utils.urls.user
    public headers = [
        { name: 'ID', key: 'id' },
        { name: 'LOGIN', key: 'key', type: 'login' },
        { name: 'NOMBRE', key: ['name', 'surname'], subKey: 'username' },
        { name: 'CORREO ELECTRÓNICO', key: 'email' },
        {
            name: 'LISTAS', key: 'wish_lists', type: 'table', headers: [
                { name: 'Principal', key: 'is_main', type: 'boolean' },
                { name: 'URL', key: 'uuid', linkName: 'Abrir lista', url: '/list/{key}', type: 'link' },
                { name: 'NAME', key: 'name', subKey: 'uuid' },
                { name: 'STEAM', key: 'steam_username' },
                { name: 'AMAZON', key: 'amazon_wishlist_id' },
                { name: 'ACTUALIZADO', key: 'updated_at', subKey: 'created_at', type: 'dateTime' },
            ]
        },
        { name: 'ACTUALIZADO', key: 'updated_at', subKey: 'created_at', type: 'dateTime' },
    ]

    constructor(private apiService: ApiService) { }

    openEditModal(id: number = 0) {
        const modalRef = this.sauModalService.open(UserFormComponent, { size: 'lg' });
        if (id) {
            modalRef.componentInstance.id = id;
        }
        modalRef.result.then(() => this.customTable.getItems(), () => { });
    }

    openDeleteModal(id: number) {
        const modalRef = this.sauModalService.open(CustomDeleteComponent, { size: 'md' });
        modalRef.componentInstance.url = this.url;
        modalRef.componentInstance.id = id;
        modalRef.result.then(() => this.customTable.getItems(), () => { });
    }
}