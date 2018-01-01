import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../app.constants';
import { SecurityService } from './SecurityService';
import { Booking } from '../models/booking';

@Injectable()
export class BookingsService {

    public actionUrl: string;
    private headers: Headers;

    constructor(private _http: Http, private _configuration: Configuration, private _securityService: SecurityService) {
        this.actionUrl = `${_configuration.Server}api/v1/Bookings/`;
    }

    private setHeaders() {

        console.log('setHeaders started');

        this.headers = new Headers();
        this.headers.append('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
        const token = this._securityService.GetToken();
        if (token !== '') {
            const tokenValue = 'Bearer ' + token;
            console.log('tokenValue:' + tokenValue);
            this.headers.append('Authorization', tokenValue);
        }
    }

    public GetAll = (): Observable<Booking[]> => {
        this.setHeaders();
        const options = new RequestOptions({ headers: this.headers, body: '' });
        return this._http.get(this.actionUrl, options).map(res => res.json());
    }

    public GetById = (id: string): Observable<any> => {
        this.setHeaders();
        const options = new RequestOptions({ headers: this.headers });
        return this._http.get(this.actionUrl + id + '/?include=organiser,menu,status,diners', options).map(res => res.json());
    }
      public DownloadExport = (id: string): void => {
        this.setHeaders();
        const options = new RequestOptions({ headers: this.headers });
        this._http.get(this.actionUrl + 'excel-export' + id, options);
    }

      // // async getById(id): Promise<Booking> {
  // //   if (!this.api) throw new Error('api not found');
  // //   const json = await this.api.bookings.getById(id);
  // //   let booking = new Booking().deserialize(json.data, json.included);
  // //   return booking;
  // // }

    public Add = (itemToAdd: any): Observable<Response> => {
        this.setHeaders();
        return this._http.post(this.actionUrl, JSON.stringify(itemToAdd), { headers: this.headers });
    }

    public Update = (id: string, itemToUpdate: any): Observable<Response> => {
        this.setHeaders();
        return this._http
            .put(this.actionUrl + id, JSON.stringify(itemToUpdate), { headers: this.headers });
    }

    public Delete = (id: number): Observable<Response> => {
        this.setHeaders();
        return this._http.delete(this.actionUrl + id, {
            headers: this.headers
        });
    }

}
