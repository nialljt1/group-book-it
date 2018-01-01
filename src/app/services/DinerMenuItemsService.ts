import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../app.constants';
import { SecurityService } from '../services/SecurityService';
import { MenuSection } from '../models/menuSection';
import { DinerMenuItem } from '../models/dinerMenuItem';

@Injectable()
export class DinerMenuItemsService {

    private actionUrl: string;
    private headers: Headers;

    constructor(private _http: Http, private _configuration: Configuration, private _securityService: SecurityService) {
        this.actionUrl = `${_configuration.Server}api/v1/diner-menu-items/`;
    }

    private setHeaders(isGet: boolean = true) {

        console.log('setHeaders started');

        this.headers = new Headers();
        if (isGet) {
          this.headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        }
        // tslint:disable-next-line:one-line
        else {
          this.headers.append('Content-Type', 'application/json');
        }

        const token = this._securityService.GetToken();
        if (token !== '') {
            const tokenValue = 'Bearer ' + token;
            console.log('tokenValue:' + tokenValue);
            this.headers.append('Authorization', tokenValue);
        }
    }

    public Add = (itemToAdd: DinerMenuItem): Observable<Response> => {
        this.setHeaders(false);
        return this._http.post(this.actionUrl, JSON.stringify(itemToAdd), { headers: this.headers });
    }

    public Delete = (id: number): Observable<Response> => {
        this.setHeaders(false);
        console.log(this.actionUrl);
        return this._http.delete(this.actionUrl + id, {
            headers: this.headers
        });
    }

    public GetForBooking = (bookingId: string): Observable<any> => {
        this.setHeaders();
        const options = new RequestOptions({ headers: this.headers });
        return this._http.get(this.actionUrl + '?include=menuItem&filter[diner.bookingId]=' + bookingId, options).map(res => res.json());

    }
}
