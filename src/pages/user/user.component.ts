import { Component, ViewEncapsulation, ViewChild, inject } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';
import { CustomDeleteComponent } from '../../components/customDelete/customDelete.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
import { SAUTableModule } from '@some-angular-utils/table';
import { SAUModalService } from '@some-angular-utils/modal';
import { RouterModule } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    imports: [
        SAUTableModule,
        RouterModule,
        FontAwesomeModule,
        NgTemplateOutlet,
        DatePipe,
        CdkOverlayOrigin,
        CdkConnectedOverlay,
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
    // 'username' and 'wish_lists' cells are rendered by the #userCell / #listsCell templates
    // (sau-table matches customTemplates by header.key), grouping what used to be 8 columns
    public headers = [
        { name: 'USUARIO', key: 'username' },
        { name: 'LISTAS', key: 'wish_lists' },
    ]

    // Button whose "N listas" dropdown is open (users with more than 3 wish lists). Keyed by the
    // origin element, not the user id: sau-table renders each custom cell twice (desktop table +
    // hidden mobile cards), and an id key would also open the hidden copy's overlay at (0,0)
    public openListsOrigin: CdkOverlayOrigin | null = null

    // Below the button, aligned left; flips above it when there's no room underneath
    public listsDropdownPositions: ConnectedPosition[] = [
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    ]

    toggleLists(origin: CdkOverlayOrigin) {
        this.openListsOrigin = this.openListsOrigin === origin ? null : origin
    }

    isAdmin(user: any): boolean {
        return Array.isArray(user.role) ? user.role.includes('ROLE_ADMIN') : user.role === 'ROLE_ADMIN';
    }

    // Sum of wish_list.views across all the user's lists (the backend returns `views` per list)
    totalViews(user: any): number {
        return (user.wish_lists ?? []).reduce((sum: number, list: any) => sum + (list.views ?? 0), 0);
    }

    constructor(private apiService: ApiService) { }

    // sau-table's editEvent/deleteEvent emit the whole row object, not its id
    openEditModal(item?: { id: number }) {
        const modalRef = this.sauModalService.open(UserFormComponent, { size: 'lg' });
        if (item?.id) {
            modalRef.componentInstance.id = item.id;
        }
        modalRef.result.then(() => this.customTable.getItems(), () => { });
    }

    openDeleteModal(item: { id: number }) {
        const modalRef = this.sauModalService.open(CustomDeleteComponent, { size: 'md' });
        modalRef.componentInstance.url = this.url;
        modalRef.componentInstance.id = item.id;
        modalRef.result.then(() => this.customTable.getItems(), () => { });
    }
}