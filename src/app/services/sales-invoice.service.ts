import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class SalesInvoiceService {

    constructor(private http: HttpClient) {
        const recordDetailsJSON = (window as any).recordDetails;
        if (recordDetailsJSON) {
            const recordDetails = JSON.parse(recordDetailsJSON);
            this.userInfo = {
                baseUrl: recordDetails.baseUrl,
                token: recordDetails.c,
                languageID: recordDetails.languageId,
                companyID: recordDetails.companyId,
                userID: 0
            };
        }
    }

    public userInfo: { baseUrl: string; token: string; languageID: number, companyID: number, userID: number } = {
        baseUrl: '',
        token: '',
        languageID: 0,
        companyID: 0,
        userID: 0
    };


    getUserInfo(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataUserInfo = new HttpParams()
            .set('UserID', this.userInfo.userID != null ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageID != null ? this.userInfo.languageID.toString() : '');

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': this.userInfo.token,
        });

        const url = `${this.userInfo.baseUrl}/api/sec/POS_UserInfo`;

        return this.http.post(url, dataUserInfo, { headers });
    }

    getUserPOS(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            DeviceCode: 'Web'
        }

        const dataUserPOS = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetUserPOS`;

        return this.http.post(url, dataUserPOS);
    }

    getCustomers(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            DataQuery: null,
            CustID: null,
        }

        const dataCustomers = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetCustomers`;

        return this.http.post(url, dataCustomers);
    }

    getBranchTables(salesDivisionID: number): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            SalesDivisionID: salesDivisionID,
        }

        const dataBranchTables = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetBranchTables`;

        return this.http.post(url, dataBranchTables);
    }

    getCategories(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataCategories = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetCategories`;

        return this.http.post(url, dataCategories);
    }

    getProducts(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataProducts = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetProducts`;

        return this.http.post(url, dataProducts);
    }

    getRetailInvoices(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataRetailInvoices = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetRetailInvoices`;

        return this.http.post(url, dataRetailInvoices);
    }

    getPromotions(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataPromotions = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetPromotions`;

        return this.http.post(url, dataPromotions);
    }

    getReceiptMethods(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataReceiptMethods = new HttpParams()
            .set('CompanyID', '1')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetReceiptMethods`;

        return this.http.post(url, dataReceiptMethods);
    }
}
