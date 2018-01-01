import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../app.constants';
import { Router } from '@angular/router';

@Injectable()
export class SecurityService {

    private _isAuthorized: boolean;
    public HasAdminRole: boolean;
    public UserData: any;

    private actionUrl: string;
    private headers: Headers;
    private storage: any;

    constructor(private _http: Http, private _configuration: Configuration, private _router: Router) {

        this.actionUrl = _configuration.Server + 'api/Bookings/';

        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
        this.storage = sessionStorage;

        if (this.retrieve('_isAuthorized') !== '') {
            this.HasAdminRole = this.retrieve('HasAdminRole');
            this._isAuthorized = this.retrieve('_isAuthorized');
        }
    }

    public IsAuthorized(): boolean {
        if (this._isAuthorized) {
            if (this.isTokenExpired('authorizationDataIdToken')) {
                console.log('IsAuthorized: isTokenExpired');
                this.ResetAuthorizationData();
                return false;
            }

            return true;
        }

        return false;
    }

    public GetToken(): any {
        return this.retrieve('authorizationData');
    }

    public ResetAuthorizationData() {
        this.store('authorizationData', '');
        this.store('authorizationDataIdToken', '');

        this._isAuthorized = false;
        this.HasAdminRole = false;
        this.store('HasAdminRole', false);
        this.store('_isAuthorized', false);
    }

    public SetAuthorizationData(token: any, id_token: any) {
        if (this.retrieve('authorizationData') !== '') {
            this.store('authorizationData', '');
        }

        this.store('authorizationData', token);
        this.store('authorizationDataIdToken', id_token);
        this._isAuthorized = true;
        this.store('_isAuthorized', true);

        // // this.getUserData()
        // //     .subscribe(data => this.UserData = data,
        // //     error => this.HandleError(error),
        // //     () => {
        // //         for (let i = 0; i < this.UserData.role.length; i++) {
        // //             if (this.UserData.role[i] === 'dataEventRecords.admin') {
        // //                 this.HasAdminRole = true;
        // //                 this.store('HasAdminRole', true);
        // //             }
        // //         }
        // //     });

                        this.HasAdminRole = true;
                        this.store('HasAdminRole', true);

        // // if the role was returned in the id_token, the roundtrip is not required
        // //var data: any = this.getDataFromToken(id_token);
        // //for (var i = 0; i < data.role.length; i++) {
        // //    if (data.role[i] === 'dataEventRecords.admin') {
        // //        this.HasAdminRole = true;
        // //        this.store('HasAdminRole', true)
        // //    }
        // //}
    }

    public Authorize() {
        this.ResetAuthorizationData();

        console.log('BEGIN Authorize, no auth data');

        const authorizationUrl = 'http://identity.groupbookit.com/connect/authorize';
        // let authorizationUrl = 'http://localhost:44313/connect/authorize';
        const client_id = 'angular2client';
        const redirect_uri = 'http://localhost:4200';
        const response_type = 'id_token token';
        const scope = 'openid profile bookingsscope';
        const nonce = 'N' + Math.random() + '' + Date.now();
        const state = Date.now() + '' + Math.random();

        this.store('authStateControl', state);
        this.store('authNonce', nonce);
        console.log('AuthorizedController created. adding myautostate: ' + this.retrieve('authStateControl'));

        const url =
            authorizationUrl + '?' +
            'response_type=' + encodeURI(response_type) + '&' +
            'client_id=' + encodeURI(client_id) + '&' +
            'redirect_uri=' + encodeURI(redirect_uri) + '&' +
            'scope=' + encodeURI(scope) + '&' +
            'nonce=' + encodeURI(nonce) + '&' +
            'state=' + encodeURI(state);

        window.location.href = url;
    }

    public AuthorizedCallback() {
        console.log('BEGIN AuthorizedCallback, no auth data');
        this.ResetAuthorizationData();

        const hash = window.location.hash.substr(1);

        // tslint:disable-next-line:no-shadowed-variable
        const result: any = hash.split('&').reduce(function(result: any, item: string) {
            const parts = item.split('=');
            result[parts[0]] = parts[1];
            return result;
        }, {});

        console.log(result);
        console.log('AuthorizedCallback created, begin token validation');

        let token = '';
        let id_token = '';
        let authResponseIsValid = false;
        if (!result.error) {

            if (result.state !== this.retrieve('authStateControl')) {
                console.log('AuthorizedCallback incorrect state');
            } else {

                token = result.access_token;
                id_token = result.id_token;

                const dataIdToken: any = this.getDataFromToken(id_token);
                console.log(dataIdToken);

                // validate nonce
                if (dataIdToken.nonce !== this.retrieve('authNonce')) {
                    console.log('AuthorizedCallback incorrect nonce');
                } else {
                    this.store('authNonce', '');
                    this.store('authStateControl', '');

                    authResponseIsValid = true;
                    console.log('AuthorizedCallback state and nonce validated, returning access token');
                }
            }
        }

        if (authResponseIsValid) {
            this.SetAuthorizationData(token, id_token);
            console.log(this.retrieve('authorizationData'));

            // router navigate to BookingsList
            this._router.navigate(['/bookings/list']);
        } else {
            this.ResetAuthorizationData();
            this._router.navigate(['/']);
        }
    }

    public Logoff() {
        // /connect/endsession?id_token_hint=...&post_logout_redirect_uri=https://myapp.com
        console.log('BEGIN Authorize, no auth data');

        const authorizationUrl = 'http://identity.groupbookit.com/connect/endsession';
        //// let authorizationUrl = 'http://localhost:44313/connect/endsession';

        const id_token_hint = this.retrieve('authorizationDataIdToken');
        const post_logout_redirect_uri = 'http://localhost:4200/';

        const url =
            authorizationUrl + '?' +
            'id_token_hint=' + encodeURI(id_token_hint) + '&' +
            'post_logout_redirect_uri=' + encodeURI(post_logout_redirect_uri);

        this.ResetAuthorizationData();

        window.location.href = url;
    }

    public HandleError(error: any) {
        console.log(error);
        if (error.status === 403) {
            this._router.navigate(['/Forbidden']);
        } else if (error.status === 401) {
            this.ResetAuthorizationData();
            this._router.navigate(['/']);
        }
    }

    private isTokenExpired(token: string, offsetSeconds?: number): boolean {
        const tokenExpirationDate = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;

        if (tokenExpirationDate == null) {
            return false;
        }

        // Token expired?
        return !(tokenExpirationDate.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
    }

    private getTokenExpirationDate(token: string): Date {
        let decoded: any;
        decoded = this.getDataFromToken(this.retrieve(token));

        if (!decoded.hasOwnProperty('exp')) {
            return null;
        }

        const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(decoded.exp);

        return date;
    }

    private urlBase64Decode(str: string) {
        let output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw new Error('Illegal base64url string!');
        }

        return window.atob(output);
    }

    private getDataFromToken(token: any) {
        let data = {};
        if (typeof token !== 'undefined') {
            const encoded = token.split('.')[1];
            data = JSON.parse(this.urlBase64Decode(encoded));
        }

        return data;
    }

    private retrieve(key: string): any {
        const item = this.storage.getItem(key);

        if (item && item !== 'undefined') {
            return JSON.parse(this.storage.getItem(key));
        }

        return;
    }

    private store(key: string, value: any) {
        this.storage.setItem(key, JSON.stringify(value));
    }

    private getUserData = (): Observable<string[]> => {
        this.setHeaders();
        //// return this._http.get('http://localhost:44313/connect/userinfo', {
        return this._http.get('http://identity.groupbookit.com/connect/userinfo', {
            headers: this.headers,
            body: ''
        }).map(res => res.json());
    }

    private setHeaders() {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        const token = this.GetToken();

        if (token !== '') {
            this.headers.append('Authorization', 'Bearer ' + token);
        }
    }
}
