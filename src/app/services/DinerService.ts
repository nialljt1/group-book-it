import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../app.constants';
import { SecurityService } from './SecurityService';
import { Diner } from '../models/diner';

declare var require: any;

@Injectable()
export class DinerService {
    private actionUrl: string;
    private headers: Headers;

    constructor(private _http: Http, private _configuration: Configuration, private _securityService: SecurityService) {
        this.actionUrl = `${_configuration.Server}api/v1/diners/`;
    }



    private setHeaders(isGet: boolean = true) {

        console.log('setHeaders started');

        this.headers = new Headers();
        if (isGet) {
          this.headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        } else {
          this.headers.append('Content-Type', 'application/vnd.api+json');
        }

        const token = this._securityService.GetToken();
        if (token !== '') {
            const tokenValue = 'Bearer ' + token;
            console.log('tokenValue:' + tokenValue);
            this.headers.append('Authorization', tokenValue);
        }
    }

    public Add = (itemToAdd: Diner): Observable<Response> => {
        this.setHeaders(false);
        return this._http.post(this.actionUrl, JSON.stringify(itemToAdd), { headers: this.headers });
    }

    public Update = (itemToUpdate: Diner): Observable<Response> => {
        this.setHeaders(false);
        const JSONAPISerializer = require('jsonapi-serializer').Serializer;
        const serializer = new JSONAPISerializer('diners', {
          attributes: ['forename', 'surname', 'notes', 'lastUpdatedAt']
        });
        const diner = serializer.serialize(itemToUpdate);
        return this._http.patch(this.actionUrl + itemToUpdate.id + '/', diner, { headers: this.headers });
    }

    public Delete = (id: number): Observable<Response> => {
        this.setHeaders(false);
        console.log(this.actionUrl);
        return this._http.delete(this.actionUrl + id, {
            headers: this.headers
        });
    }
}
