import { Component, ViewEncapsulation, ViewChild, inject } from '@angular/core';
import { Utils } from '../../../utils/utils';
import { CustomDeleteComponent } from '../../../components/customDelete/customDelete.component';
import { SAUTableModule } from "@some-angular-utils/table";
import { SAUModalService } from '@some-angular-utils/modal';

@Component({
    imports: [
        SAUTableModule,
    ],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ContactListComponent {

    @ViewChild('customTable') customTable!: SAUTableModule;

    private sauModalService = inject(SAUModalService);

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

    // sau-table's deleteEvent emits the whole row object, not its id
    openDeleteModal(item: { id: number }) {
        const modalRef = this.sauModalService.open(CustomDeleteComponent, { size: 'md' });
        modalRef.componentInstance.url = this.url;
        modalRef.componentInstance.id = item.id;
        modalRef.result.then(() => this.customTable.getItems(), () => { });
    }
}