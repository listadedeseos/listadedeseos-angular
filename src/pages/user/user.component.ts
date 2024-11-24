import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../../apiConnection/ApiService';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Utils } from '../../utils/utils';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class UserComponent {

    loading: boolean = true;
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    resultsLength: number = 0;
    displayedColumns: string[] = ['id', 'name', 'email', 'role', 'created_at', 'updated_at'];
    displayedItems: string[] = ['id', 'name', 'email', 'role'];

    @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
    @ViewChild(MatSort) sort: MatSort | null = null;

    constructor(private apiService: ApiService) { }

    ngAfterViewInit() {

        merge(this.sort!.sortChange, this.paginator!.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.loading = true
                    return this.apiService.getPetition(Utils.urls.user, '?page=' + (this.paginator!.pageIndex + 1) + '&limit=' + this.paginator!.pageSize)
                        .pipe(catchError(() => observableOf(null)))
                }),
                map((data: any) => {

                    if (data === null) {
                        return [];
                    }

                    this.resultsLength = data.total
                    return data.list;
                }),
            )
            .subscribe(data => {
                this.dataSource.data = data
                this.loading = false
            })

    }
}
