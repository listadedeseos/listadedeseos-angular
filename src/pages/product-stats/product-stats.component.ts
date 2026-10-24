import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SAUTableModule } from '@some-angular-utils/table';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApiService } from '../../apiConnection/ApiService';
import { Utils } from '../../utils/utils';

export type StatsSource = 'steam' | 'amazon' | 'products';
export type StatsSort = 'count' | 'reserved' | 'name' | 'recent';

@Component({
    imports: [
        SAUTableModule,
        RouterModule,
        FontAwesomeModule,
    ],
    templateUrl: './product-stats.component.html',
    styleUrl: './product-stats.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class ProductStatsComponent implements OnInit, OnDestroy {

    @ViewChild('customTable') customTable?: SAUTableModule;

    private apiService = inject(ApiService);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    public sources: { value: StatsSource, label: string, icon: [string, string], title: string, subtitle: string }[] = [
        {
            value: 'steam', label: 'Steam', icon: ['fab', 'steam'], title: 'Juegos de Steam',
            subtitle: 'Juegos importados de las listas de deseados de Steam y en cuántas listas aparece cada uno.',
        },
        {
            value: 'amazon', label: 'Amazon', icon: ['fab', 'amazon'], title: 'Productos de Amazon',
            subtitle: 'Productos importados de las listas de Amazon, agrupados por producto (ASIN).',
        },
        {
            value: 'products', label: 'Productos', icon: ['fas', 'gift'], title: 'Productos añadidos',
            subtitle: 'Productos añadidos a mano por los usuarios, agrupados por nombre.',
        },
    ]

    public sorts: { value: StatsSort, label: string }[] = [
        { value: 'count', label: 'Más repetidos' },
        { value: 'reserved', label: 'Más reservados' },
        { value: 'recent', label: 'Añadidos recientemente' },
        { value: 'name', label: 'Nombre (A-Z)' },
    ]

    // Keys of the API's `summary` field
    public summaryCards = [
        { key: 'products', label: 'Productos distintos' },
        { key: 'occurrences', label: 'Veces en listas' },
        { key: 'repeated', label: 'En 2 o más listas' },
        { key: 'reserved', label: 'Reservados' },
        { key: 'lists', label: 'Listas con productos' },
    ]

    // 'name' and 'count' cells are rendered by the #productCell / #countCell templates, 'lists' by
    // #listsCell (sau-table matches customTemplates by header.key)
    public headers = [
        { name: 'PRODUCTO', key: 'name' },
        { name: 'VECES', key: 'count' },
        { name: 'LISTAS', key: 'lists' },
    ]

    public source: StatsSource = 'steam'
    public sort: StatsSort = 'count'
    public search = ''
    public url = ''
    public summary: { [key: string]: number | undefined } = {}
    // Product keys whose full list of wish lists is shown (otherwise only the first few)
    public expanded = new Set<string>()
    public readonly visibleLists = 4

    private searchTimeout?: ReturnType<typeof setTimeout>
    private routeSub?: Subscription

    ngOnInit() {
        // Same component for the 3 sources, so it's reused when switching tabs
        this.routeSub = this.route.paramMap.subscribe(params => {
            const source = params.get('source') as StatsSource
            this.source = this.sources.some(s => s.value === source) ? source : 'steam'
            this.expanded.clear()
            this.reload()
        })
    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe()
        clearTimeout(this.searchTimeout)
    }

    get current() {
        return this.sources.find(s => s.value === this.source)!
    }

    private buildUrl(): string {
        const params = new URLSearchParams({ sort: this.sort })
        if (this.search.trim()) {
            params.set('search', this.search.trim())
        }
        return Utils.urls.stats + '/' + this.source + '?' + params.toString()
    }

    private reload() {
        this.url = this.buildUrl()
        this.loadSummary()
        // On first load the table fetches by itself (ngAfterViewInit); afterwards it doesn't reload
        // on [url] changes, so push the new [url] into it and call onPageChange(1), which also
        // resets pagination
        if (this.customTable) {
            this.cdr.detectChanges()
            ;(this.customTable as any).onPageChange(1)
        }
    }

    loadSummary() {
        this.apiService.getPetition(this.url, '&page=1&limit=1').subscribe({
            next: (value: any) => {
                this.summary = value.summary ?? {}
                this.cdr.detectChanges()
            },
        })
    }

    setSort(sort: StatsSort) {
        this.sort = sort
        this.reload()
    }

    onSearch(value: string) {
        this.search = value
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => this.reload(), 350)
    }

    toggleExpanded(key: string) {
        this.expanded.has(key) ? this.expanded.delete(key) : this.expanded.add(key)
    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src = '/assets/img/empty.webp'
    }
}
