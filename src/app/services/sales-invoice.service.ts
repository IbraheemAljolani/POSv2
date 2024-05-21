import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class SalesInvoiceService {



    constructor(private http: HttpClient) {
        // Comment for testing purpose only
        // const recordDetailsJSON = (window as any).recordDetails;
        // if (recordDetailsJSON) {
        //     const recordDetails = JSON.parse(recordDetailsJSON);
        //     this.userInfo = {
        //         baseUrl: recordDetails.baseUrl,
        //         token: recordDetails.c,
        //         languageID: recordDetails.languageId,
        //         companyID: recordDetails.companyId,
        //         userID: 0
        //     };
        // }
    }

    // Test data for userInfo object
    public userInfo: { baseUrl: string; token: string; userID: number; languageID: number, companyID: number } = {
        baseUrl: "https://proxypos.trio365.com",
        token: "bVsLmyoAiOo-IjfUC7rc9dgJRnmB7bsrE8BtEd97gLxFbvNuGIDXLg63i5lKp0KSlR2t09bh42Kg13icYu2s0D2B9hv3i2fpqKEvWQMq4MvTmpvztHWeveSj-BYn-xf5xdesDhc_hVsS4u_M1fBfyUGwpO2KcCkAc409y8jzh0jLye86P_4EGUbT0WbIiqHZIDAhnNAlByuya56fztAEXE-MUqSVhbmsJgRFEaziohAnf2xA67mreBU8ZzmD5ujC1lCTXnA-BLzx4u-IqsHwOMzAfVq1MVKu998645YC7pXCr9pqNuE8iSpAb0AXAeww",
        userID: 87,
        languageID: 1,
        companyID: 1,
    }

    // Live data for userInfo object
    // public userInfo: { baseUrl: string; token: string; languageID: number, companyID: number, userID: number } = {
    //     baseUrl: '',
    //     token: '',
    //     languageID: 0,
    //     companyID: 0,
    //     userID: 0
    // };

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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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

        let query = {
            SalesDivisionPOSID: 20,
        }

        const dataRetailInvoices = new HttpParams()
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
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
            .set('CompanyID', this.userInfo.companyID ? this.userInfo.companyID.toString() : '')
            .set('UserID', this.userInfo.userID ? this.userInfo.userID.toString() : '')
            .set('LanguageID', this.userInfo.languageID ? this.userInfo.languageID.toString() : '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_GetReceiptMethods`;

        return this.http.post(url, dataReceiptMethods);
    }

    retailInvoice_Create(data: any): Observable<any> {
        if (!this.userInfo) {
            throw new Error('User info is not defined');
        }

        const createProductObject = (product: { ProductID: any; RetailInvoiceID: any; UOMID: any; TaxGroupID: any; Description: any; UOMDescription: any; ReturnedQty: any; ReturnQty: any; Qty: any; RemainingQty: any; Amount: any; TaxPercentage: any; DiscountPercentage: any; DiscountPerUnit: any; NetTotalBeforeDiscount: any; TotalDiscount: any; NetTotalAfterDiscount: any; TaxAmount: any; NetTotalAfterTax: any; SalesPrice: any; CurrencyID: any; RetailOrderReferenceTransCode: any; Note: any; }) => ({
            ProductID: product?.ProductID,
            RetailInvoiceID: product?.RetailInvoiceID,
            UOMID: product?.UOMID,
            TaxGroupID: product?.TaxGroupID,
            Description: product?.Description,
            UOMDescription: product?.UOMDescription,
            ReturnedQty: product?.ReturnedQty,
            ReturnQty: product?.ReturnQty,
            Qty: product?.Qty,
            RemainingQty: product?.RemainingQty,
            Amount: product?.Amount,
            TaxPercentage: product?.TaxPercentage,
            DiscountPercentage: product?.DiscountPercentage,
            DiscountPerUnit: product?.DiscountPerUnit,
            NetTotalBeforeDiscount: product?.NetTotalBeforeDiscount,
            TotalDiscount: product?.TotalDiscount,
            NetTotalAfterDiscount: product?.NetTotalAfterDiscount,
            TaxAmount: product?.TaxAmount,
            NetTotalAfterTax: product?.NetTotalAfterTax,
            Additions: [],
            Seriales: [],
            Batches: [],
            SalesPrice: product?.SalesPrice,
            CurrencyID: product?.CurrencyID,
            AppReferenceTransCode: data?.AppReferenceTransCode,
            RetailOrderReferenceTransCode: product?.RetailOrderReferenceTransCode,
            Note: product?.Note,
        });



        const createPaymentObject = (payment: { RetailInvoiceID: any; SalesDivisionID: any; Amount: any; CashReceiptAmount: any; CashReturnedAmount: any; ReceiptMethodID: any; ReceiptMethodTypeID: any; ReceiptTypeID: any; CardNumber: any; CouponID: any; LoyaltyCardID: any; LoyaltyPoints: any; PaymentDate: any; CashierID: any; Note: any; }) => ({
            RetailInvoiceID: payment?.RetailInvoiceID,
            SalesDivisionID: payment?.SalesDivisionID,
            Amount: payment?.Amount,
            CashReceiptAmount: payment?.CashReceiptAmount,
            CashReturnedAmount: payment?.CashReturnedAmount,
            ReceiptMethodID: payment?.ReceiptMethodID,
            ReceiptMethodTypeID: payment?.ReceiptMethodTypeID,
            ReceiptTypeID: payment?.ReceiptTypeID,
            CardNumber: payment?.CardNumber,
            CouponID: payment?.CouponID,
            LoyaltyCardID: payment?.LoyaltyCardID,
            LoyaltyPoints: payment?.LoyaltyPoints,
            PaymentDate: payment?.PaymentDate,
            CashierID: payment?.CashierID,
            Note: payment?.Note,
        });

        const dataString = {
            Code: data.Code,
            POSCode: data.POSCode,
            SalesInvoiceStatusID: data.SalesInvoiceStatusID,
            CustID: data.CustID,
            Description: data.Description,
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
            Products: data.Products.map((product: { ProductID: any; RetailInvoiceID: any; UOMID: any; TaxGroupID: any; Description: any; UOMDescription: any; ReturnedQty: any; ReturnQty: any; Qty: any; RemainingQty: any; Amount: any; TaxPercentage: any; DiscountPercentage: any; DiscountPerUnit: any; NetTotalBeforeDiscount: any; TotalDiscount: any; NetTotalAfterDiscount: any; TaxAmount: any; NetTotalAfterTax: any; SalesPrice: any; CurrencyID: any; RetailOrderReferenceTransCode: any; Note: any; }) => createProductObject(product)),
            Payments: data.Payments.map((payment: { RetailInvoiceID: any; SalesDivisionID: any; Amount: any; CashReceiptAmount: any; CashReturnedAmount: any; ReceiptMethodID: any; ReceiptMethodTypeID: any; ReceiptTypeID: any; CardNumber: any; CouponID: any; LoyaltyCardID: any; LoyaltyPoints: any; PaymentDate: any; CashierID: any; Note: any; }) => createPaymentObject(payment)),
            Note: data.Note,
            ReferenceCode: data.ReferenceCode,
            CashBookID: data.CashBookID,
            CreatedDate: data.CreatedDate,
        };

        const dataRetailInvoice_Create = new HttpParams()
            .set('CompanyID', this.userInfo.companyID?.toString() || '')
            .set('UserID', this.userInfo.userID?.toString() || '')
            .set('DataString', JSON.stringify(dataString))
            .set('LanguageID', this.userInfo.languageID?.toString() || '');

        const url = `${this.userInfo.baseUrl}/api/ext/POS_RetailInvoice_Create`;

        return this.http.post(url, dataRetailInvoice_Create);
    }
}
