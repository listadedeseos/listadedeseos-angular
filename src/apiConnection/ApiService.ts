import { HttpClient } from "@angular/common/http";
import { Utils } from "../utils/utils";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root'
})
export class ApiService{

    constructor(private http: HttpClient) { }

    postPetition(url: Utils.urls, body: any): Observable<Object>{
        return this.http.post(url, body)
    }

    getPetition(url: Utils.urls, params: string): Observable<Object>{
        return this.http.get(url + params)
    }

}