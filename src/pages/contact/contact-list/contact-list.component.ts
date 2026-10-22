import { ChangeDetectorRef, Component, ViewEncapsulation, ViewChild, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Utils } from '../../../utils/utils';
import { ApiService } from '../../../apiConnection/ApiService';
import { CustomDeleteComponent } from '../../../components/customDelete/customDelete.component';
import { SAUTableModule } from "@some-angular-utils/table";
import { SAUModalService } from '@some-angular-utils/modal';

export type ContactStatus = 'pending' | 'in_progress' | 'done' | 'discarded';

@Component({
    imports: [
        SAUTableModule,
        DatePipe,
    ],
    templateUrl: './contact-list.component.html',
    styleUrl: './contact-list.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ContactListComponent {

    @ViewChild('customTable') customTable!: SAUTableModule;

    private sauModalService = inject(SAUModalService);
    private apiService = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);

    loading: boolean = true;

    public url = Utils.urls.contact
    // 'title' and 'status' cells are rendered by the #messageCell / #statusCell templates
    // (sau-table matches customTemplates by header.key)
    public headers = [
        { name: 'MENSAJE', key: 'title' },
        { name: 'ESTADO', key: 'status' },
    ]

    public statuses: { value: ContactStatus, label: string, classes: string }[] = [
        { value: 'pending', label: 'Pendiente', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
        { value: 'in_progress', label: 'En curso', classes: 'bg-admin-light text-admin border-admin-border' },
        { value: 'done', label: 'Hecha', classes: 'bg-reserved-light text-reserved border-reserved-border' },
        { value: 'discarded', label: 'Descartada', classes: 'bg-swatch text-muted border-line' },
    ]

    public types: { [key: string]: { label: string, classes: string } } = {
        suggestion: { label: 'Sugerencia', classes: 'bg-primary-50 text-primary-600 border-primary-200' },
        complaint: { label: 'Error o queja', classes: 'bg-danger-light text-danger border-danger-border' },
        question: { label: 'Consulta', classes: 'bg-cream-alt text-muted-dark border-line' },
    }

    public tabs: { value: ContactStatus | '', label: string }[] = [
        { value: '', label: 'Todas' },
        ...this.statuses.map(({ value, label }) => ({ value, label })),
    ]

    // Active tab ('' = all) and per-status totals for the tab badges
    public statusFilter: ContactStatus | '' = 'pending'
    public counts: { [key: string]: number | undefined } = {}
    public expanded = new Set<number>()

    ngOnInit() {
        this.url = this.buildUrl()
        this.loadCounts()
    }

    get totalCount(): number {
        return Object.values(this.counts).reduce((sum: number, n) => sum + (n ?? 0), 0)
    }

    getStatus(value: string) {
        return this.statuses.find(s => s.value === value) ?? this.statuses[0]
    }

    private buildUrl(): string {
        return Utils.urls.contact + (this.statusFilter ? '?status=' + this.statusFilter : '')
    }

    setFilter(status: ContactStatus | '') {
        this.statusFilter = status
        this.url = this.buildUrl()
        this.cdr.detectChanges() // push the new [url] into the table before reloading
        // sau-table doesn't reload on [url] changes; onPageChange(1) also resets pagination
        ;(this.customTable as any).onPageChange(1)
    }

    loadCounts() {
        this.apiService.getPetition(Utils.urls.contact, '?page=1&limit=1').subscribe({
            next: (value: any) => {
                this.counts = value.counts ?? {}
                this.cdr.detectChanges()
            },
        })
    }

    changeStatus(item: any, status: ContactStatus) {
        const previous = item.status
        item.status = status

        this.apiService.save(Utils.urls.contact, { status }, item.id + '/status').subscribe({
            next: () => {
                Utils.ToastUtils.success('Estado actualizado', '"' + item.title + '" → ' + this.getStatus(status).label)
                this.loadCounts()
                // Under a status tab the row no longer belongs there, so reload it
                if (this.statusFilter) {
                    this.customTable.getItems()
                }
            },
            error: () => {
                item.status = previous
                this.cdr.detectChanges()
                Utils.ToastUtils.error('Error', 'No se pudo cambiar el estado')
            },
        })
    }

    mailto(item: any): string {
        return 'mailto:' + item.email + '?subject=' + encodeURIComponent('Re: ' + item.title)
    }

    toggleExpanded(id: number) {
        this.expanded.has(id) ? this.expanded.delete(id) : this.expanded.add(id)
    }

    // sau-table's deleteEvent emits the whole row object, not its id
    openDeleteModal(item: { id: number }) {
        const modalRef = this.sauModalService.open(CustomDeleteComponent, { size: 'md' });
        modalRef.componentInstance.url = this.url.split('?')[0];
        modalRef.componentInstance.id = item.id;
        modalRef.result.then(() => {
            this.customTable.getItems()
            this.loadCounts()
        }, () => { });
    }
}
