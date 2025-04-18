import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

    save(url: string, body: any, id: number | string = 0): Observable<Object> {
        if (id != 0) {
            return this.http.put(url + '/' + id, body)
        }
        return this.http.post(url, body)
    }

    getPetition(url: string, params: string = ''): Observable<Object> {
        return this.http.get(url + params)
    }

    getById(url: string, id: number): Observable<Object> {
        return this.http.get(url + '/' + id)
    }

    deleteById(url: string, id: number): Observable<Object> {
        return this.http.delete(url + '/' + id)
    }

}