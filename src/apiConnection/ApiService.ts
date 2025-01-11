import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

    postPetition(url: string, body: any): Observable<Object> {
        return this.http.post(url, body)
    }

    getPetition(url: string, params: string = ''): Observable<Object> {
        return this.http.get(url + params)
    }

    getById(url: string, id: number): Observable<Object> {
        return this.http.get(url + '/' + id)
    }

}