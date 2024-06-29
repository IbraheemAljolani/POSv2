import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IUserInfo } from '../Interface/iuser-info';

@Injectable({
    providedIn: 'root'
})

export class SalesInvoiceService {

    constructor(
        private http: HttpClient,
    ) { }

    // Test data for userInfo object
    // public userInfo: { baseUrl: string; token: string; userID: number; languageID: number, companyID: number } = {
    //     baseUrl: "https://proxypos.trio365.com",
    //     token: "UgSZMY1gUZQ40VnIs82Sa85yLjRkZaelRCR53IrRoKhCYbnQ3UqtwxxZAvo4vxWyAl5OSnl78JSWYLuz0E51xvviG1O3JBn5KVsjmX_Av9bvgfNz3MSVaqFtvudlsNf56wXls3tr6aBw4CxyCDGO0f6PsP-rQ8F6Ne3unPSxu0tj9ekt0NXx7GDymX8YswWsAii1N8U9kQZ6vdoyorb5xA51u9X4scvGnuil3jtSX6DzC290uZnIpdaMPguBb4kOcBs2iinb9j9iXJr6425CiHckA4-V33quazVWvNBDstqg865bubCAhF4n-xL-xplpDk1VE8kgnSeSfLStyyGa8Q",
    //     userID: 87,
    //     languageID: 2,
    //     companyID: 1,
    // }

    // Live data for userInfo object
    userInfo: IUserInfo = (window as any).recordDetails;

    Sys_Labels(currentLanguage: number): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataUserInfo = new HttpParams()
            .set('LanguageID', (currentLanguage ?? '1').toString());

        const url = `${this.userInfo.baseUrl}/api/sec/Gen_Sys_Labels`;

        return this.http.post(url, dataUserInfo);
    }

    getUserInfo(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataUserInfo = new HttpParams()
            .set('UserID', this.userInfo.userID != null ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageId != null ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_UserInfo`;

        return this.http.post(url, dataUserInfo);
    }

    getUserPOS(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            DeviceCode: 'Web'
        }

        const dataUserPOS = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetUserPOS`;

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
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetCustomers`;

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
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetBranchTables`;

        return this.http.post(url, dataBranchTables);
    }

    getCategories(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataCategories = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetCategories`;

        return this.http.post(url, dataCategories);
    }

    getProducts(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataProducts = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetProducts`;

        return this.http.post(url, dataProducts);
    }

    getRetailInvoices(POSID: number): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            SalesDivisionPOSID: POSID,
        }


        const dataRetailInvoices = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetRetailInvoices`;

        return this.http.post(url, dataRetailInvoices);
    }

    getPromotions(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {}

        const dataPromotions = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetPromotions`;

        return this.http.post(url, dataPromotions);
    }

    getReceiptMethods(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataReceiptMethods = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetReceiptMethods`;

        return this.http.post(url, dataReceiptMethods);
    }

    getLookups(): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataLookups = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetLookups`;

        return this.http.post(url, dataLookups);
    }

    getProductsStock(SalesDivisionPOSID: number, ProductID: number): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        let query = {
            SalesDivisionPOSID: SalesDivisionPOSID,
            Products: ProductID,
        }

        const dataProductsStock = new HttpParams()
            .set('CompanyID', this.userInfo.companyId ? this.userInfo.companyId.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('Query', JSON.stringify(query))
            .set('Paging', '')
            .set('LanguageID', this.userInfo.languageId ? this.userInfo.languageId.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_GetProductsStock`;

        return this.http.post(url, dataProductsStock);
    }

    retailInvoice_Create(data: any): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const createProductObject = (product: any) => ({
            ProductID: product.ProductID,
            RetailInvoiceID: product.RetailInvoiceID,
            UOMID: product.UOMID,
            TaxGroupID: product.TaxGroupID,
            Description: product.Description,
            UOMDescription: product.UOMDescription,
            ReturnedQty: product.ReturnedQty,
            ReturnQty: product.ReturnQty,
            Qty: product.Qty,
            RemainingQty: product.RemainingQty,
            Amount: product.Amount,
            TaxPercentage: product.TaxPercentage,
            DiscountPercentage: product.DiscountPercentage,
            DiscountPerUnit: product.DiscountPerUnit,
            NetTotalBeforeDiscount: product.NetTotalBeforeDiscount,
            TotalDiscount: product.TotalDiscount,
            NetTotalAfterDiscount: product.NetTotalAfterDiscount,
            TaxAmount: product.TaxAmount,
            NetTotalAfterTax: product.NetTotalAfterTax,
            SalesPrice: product.SalesPrice,
            CurrencyID: product.CurrencyID,
            AppReferenceTransCode: data.AppReferenceTransCode,
            RetailOrderReferenceTransCode: product.RetailOrderReferenceTransCode,
            Note: product.Note,
        });

        const createPaymentObject = (payment: any) => ({
            RetailInvoiceID: payment.RetailInvoiceID ?? null,
            SalesDivisionID: data.SalesDivisionPOSID ?? null,
            Amount: data.Amounts ?? 0,
            CashReceiptAmount: payment.Amount ?? 0,
            CashReturnedAmount: (payment.Amount - data.Amounts ?? 0).toFixed(3),
            ReceiptMethodID: payment.ReceiptMethodID,
            ReceiptMethodTypeID: payment.ReceiptMethodTypeID,
            ReceiptTypeID: payment.ReceiptTypeID,
            CardNumber: payment.CardNumber,
            CouponID: payment.CouponID,
            LoyaltyCardID: payment.LoyaltyCardID,
            LoyaltyPoints: payment.LoyaltyPoints,
            PaymentDate: payment.invoiceDate,
            CashierID: payment.CashierID,
            Note: payment.Note,
        });

        const dataString = {
            Code: data.Code,
            POSCode: data.POSCode,
            SalesInvoiceStatusID: data.SalesInvoiceStatusID,
            CustID: data.CustID,
            Description: data.CustDescription,
            CustDescription: data.CustDescription,
            ManualDiscountAmount: data.ManualDiscountAmount,
            DiscountPercentage: data.DiscountPercentage,
            TipAmount: data.TipAmount,
            TableID: data.TableID,
            ServiceCharge: data.ServiceCharge,
            SalesDivisionPOSID: data.SalesDivisionPOSID,
            RetailOrderReferenceCode: data.RetailOrderReferenceCode,
            RetailOrderID: data.RetailOrderID,
            SalesInvoiceDate: data.SalesInvoiceDate,
            Products: data.Products.map(createProductObject),
            Payments: data.Payments.map(createPaymentObject),
            Note: data.Note,
            ReferenceCode: data.ReferenceCode,
            CashBookID: data.CashBookID,
            CreatedDate: data.CreatedDate,
        };

        const dataRetailInvoice_Create = new HttpParams()
            .set('CompanyID', this.userInfo.companyId?.toString() || '')
            .set('UserID', this.userInfo.userID?.toString() || '')
            .set('DataString', JSON.stringify(dataString))
            .set('LanguageID', this.userInfo.languageId?.toString() || '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_RetailInvoice_Create`;

        return this.http.post(url, dataRetailInvoice_Create);
    }

    RetailInvoice_Void(retailInvoiceID: number): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const dataRetailInvoice_Create = new HttpParams()
            .set('CompanyID', this.userInfo.companyId?.toString() || '')
            .set('UserID', this.userInfo.userID?.toString() || '')
            .set('RetailInvoiceID', retailInvoiceID?.toString() || '')
            .set('LanguageID', this.userInfo.languageId?.toString() || '');

        const url = `${this.userInfo.baseUrl}/api/sec/POS_RetailInvoice_Void`;

        return this.http.post(url, dataRetailInvoice_Create);
    }
}
