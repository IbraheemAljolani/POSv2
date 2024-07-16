import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TranslationService } from './translation.service';
import { InitService } from './init.service';
import { AlertPopupService } from './alert-popup.service';
import { BranchTablesService } from './branch-tables.service';
import { DialogService } from './dialog.service';
import { ProductService } from './product.service';
import { RecallService } from './recall.service';
import { PromoAndMethodService } from './promo-and-method.service';
import { PrintInvoiceService } from './print-invoice.service';

@Injectable({
    providedIn: 'root'
})

export class SalesInvoiceService {

    constructor(
        private http: HttpClient,
        public translationService: TranslationService,
        public initService: InitService,
        public alertPopupService: AlertPopupService,
        public branchTablesService: BranchTablesService,
        public dialogService: DialogService,
        public productService: ProductService,
        public recallService: RecallService,
        public promoAndMethodService: PromoAndMethodService,
        public printInvoiceService: PrintInvoiceService
    ) { }

    Sys_Labels(currentLanguage: number): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataUserInfo = new HttpParams()
            .set('LanguageID', (currentLanguage ?? '1').toString());

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/Gen_Sys_Labels`;

        return this.http.post(url, dataUserInfo);
    }

    getUserInfo(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataUserInfo = new HttpParams()
            .set('UserID', this.translationService.userInfo.userID != null ? this.translationService.userInfo.userID.toString() : '')
            .set('LanguageID', this.translationService.userInfo.languageId != null ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_UserInfo`;

        return this.http.post(url, dataUserInfo);
    }

    getUserPOS(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {
            DeviceCode: 'Web'
        }

        const dataUserPOS = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetUserPOS`;

        return this.http.post(url, dataUserPOS);
    }

    getCustomers(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {
            DataQuery: null,
            CustID: null,
        }

        const dataCustomers = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetCustomers`;

        return this.http.post(url, dataCustomers);
    }

    getBranchTables(salesDivisionID: number): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {
            SalesDivisionID: salesDivisionID,
        }

        const dataBranchTables = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetBranchTables`;

        return this.http.post(url, dataBranchTables);
    }

    getCategories(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {}

        const dataCategories = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetCategories`;

        return this.http.post(url, dataCategories);
    }

    getProducts(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {}

        const dataProducts = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetProducts`;

        return this.http.post(url, dataProducts);
    }

    getRetailInvoices(POSID: number): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {
            SalesDivisionPOSID: POSID,
        }


        const dataRetailInvoices = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetRetailInvoices`;

        return this.http.post(url, dataRetailInvoices);
    }

    getPromotions(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {}

        const dataPromotions = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetPromotions`;

        return this.http.post(url, dataPromotions);
    }

    getReceiptMethods(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataReceiptMethods = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetReceiptMethods`;

        return this.http.post(url, dataReceiptMethods);
    }

    getLookups(): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataLookups = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetLookups`;

        return this.http.post(url, dataLookups);
    }

    getProductsStock(SalesDivisionPOSID: number, ProductID: number): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        let query = {
            SalesDivisionPOSID: SalesDivisionPOSID,
            Products: ProductID,
            GetOtherStores: false,
        }

        const dataProductsStock = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId ? this.translationService.userInfo.companyId.toString() : '')
            .set('UserID', this.translationService.userInfo.userID ? this.translationService.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.translationService.userInfo.languageId ? this.translationService.userInfo.languageId.toString() : '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_GetProductsStock`;

        return this.http.post(url, dataProductsStock);
    }

    retailInvoice_Create(data: any): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataRetailInvoice_Create = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId?.toString() || '')
            .set('UserID', this.translationService.userInfo.userID?.toString() || '')
            .set('DataString', JSON.stringify(this.recallService.retailInvoiceCreate(data)))
            .set('LanguageID', this.translationService.userInfo.languageId?.toString() || '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_RetailInvoice_Create`;

        return this.http.post(url, dataRetailInvoice_Create);
    }

    RetailInvoice_Void(retailInvoiceID: number): Observable<any> {
        if (!this.translationService.userInfo) {
            this.translationService.userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}');
        }

        const dataRetailInvoice_Create = new HttpParams()
            .set('CompanyID', this.translationService.userInfo.companyId?.toString() || '')
            .set('UserID', this.translationService.userInfo.userID?.toString() || '')
            .set('RetailInvoiceID', retailInvoiceID?.toString() || '')
            .set('LanguageID', this.translationService.userInfo.languageId?.toString() || '');

        const url = `${this.translationService.userInfo.baseUrl}/api/sec/POS_RetailInvoice_Void`;

        return this.http.post(url, dataRetailInvoice_Create);
    }
}
