import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';

interface Payment {
  ReceiptMethodTypeID: string;
  DescriptionEn: string;
  Note: string;
  Amount: number;
  CashReceiptAmount: number;
  CashReturnedAmount: number;
  PaymentDate: string;
}

interface Invoice {
  Products: any[];
  NetTotalAfterTax: number;
  SalesInvoiceStatusID: string;
  Payments: Payment[];
  ServiceCharge: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecallService {

  constructor() { }

  processInvoices(invoices: any[], filterRecallSearch: string[], datepicker: string): any[] {
    return filterRecallSearch.includes('date')
      ? this.filterByDate(invoices, filterRecallSearch, datepicker)
      : this.filterByStatus(invoices, filterRecallSearch);
  }

  private filterByDate(invoices: any[], filterRecallSearch: string[], datepicker: string): any[] {
    return invoices.filter(({ CreatedDate, SalesInvoiceStatusID }) => {
      const dateMatches = CreatedDate.slice(0, 10) === datepicker;
      const statusMatches = filterRecallSearch.length > 1
        ? SalesInvoiceStatusID && filterRecallSearch.includes(SalesInvoiceStatusID.toLowerCase())
        : true;
      return dateMatches && statusMatches;
    });
  }

  private filterByStatus(invoices: any[], filterRecallSearch: string[]): any[] {
    return filterRecallSearch.length === 1
      ? invoices.filter(({ SalesInvoiceStatusID }) =>
        filterRecallSearch.includes(SalesInvoiceStatusID.toLowerCase())
      )
      : invoices;
  }

  searchRecall(value: string, retailInvoices: any) {
    return retailInvoices.filter(({ Code, ID, CustDescription }: { Code: string, ID: number, CustDescription: string }) =>
      Code.includes(value) || ID.toString().includes(value) || CustDescription.includes(value));
  }

  changeRecallFilterDate(date: Date) {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }

  invoiceDetails(invoice: Invoice): any {
    const { Products: addToCart, NetTotalAfterTax: initialPaidAmount, SalesInvoiceStatusID, Payments, ServiceCharge } = invoice;
    let selectedPayments: any[] = [];
    let paidAmount = initialPaidAmount;
    let totalAmount = 0;
    let serviceCharge = 0;

    if (SalesInvoiceStatusID === "Printed" && Payments.length > 0) {
      const { CashReceiptAmount, CashReturnedAmount, ReceiptMethodTypeID, DescriptionEn, Note, Amount, PaymentDate } = Payments[0];

      totalAmount = CashReceiptAmount;
      paidAmount = CashReturnedAmount;
      serviceCharge = ServiceCharge;

      selectedPayments.unshift({
        ReceiptMethodTypeID,
        Description: DescriptionEn,
        Note,
        Amount,
        SoldAmount: 0,
        invoiceDate: PaymentDate
      });
    }

    return {
      addToCart,
      selectedPayments,
      selectedInvoice: invoice,
      selectedInvoiceProducts: addToCart,
      activeInvoiceTab: 'invoice',
      paidAmount,
      totalAmount,
      serviceCharge
    };
  }

  generatePOSCode(currentDate: Date, userInfo: any): string {
    return `${userInfo.SalesDivision.SalesDivisionID}/${userInfo.SalesDivision.SalesDivisionPosID}/${currentDate.getFullYear().toString().slice(-2)}/${currentDate.getMonth() + 1}-${Math.floor(Math.random() * 100)}`;
  }

  getTableID(): string | null {
    const table = sessionStorage.getItem('selectedTable');
    return table ? JSON.parse(table).ID : null;
  }

  getCustomer(): any {
    const customer = sessionStorage.getItem('selectCustomer');
    return customer ? JSON.parse(customer) : null;
  }

  constructInvoiceData(cart: any, selectedInvoice: any, selectedPayments: any, userInfo: any, serviceCharge: boolean): any {
    const invoiceDate = selectedInvoice?.SalesInvoiceDate ? new Date(selectedInvoice.SalesInvoiceDate) : new Date();
    const adjustedDate = new Date(invoiceDate.getTime() + 3 * 60 * 60 * 1000);
    return {
      Code: selectedInvoice?.Code || null,
      POSCode: this.generatePOSCode(adjustedDate, userInfo),
      SalesInvoiceStatusID: selectedInvoice?.SalesInvoiceStatusID || 'Created',
      CustID: userInfo.DefaultCustomer.CustID,
      Description: this.getCustomer()?.Description || null,
      CustDescription: this.getCustomer()?.Description || null,
      ManualDiscountAmount: selectedInvoice?.ManualDiscountAmount || 0.0,
      DiscountPercentage: selectedInvoice?.DiscountPercentage || 0.0,
      TipAmount: selectedInvoice?.TipAmount || 0.0,
      TableID: this.getTableID(),
      ServiceCharge: serviceCharge ? 1 : 0,
      SalesDivisionPOSID: userInfo.RetailUserPOS.SalesDivisionPOSID || 0,
      RetailOrderReferenceCode: selectedInvoice?.RetailOrderReferenceCode || null,
      RetailOrderID: selectedInvoice?.RetailOrderID || null,
      SalesInvoiceDate: adjustedDate,
      Products: cart,
      Payments: selectedPayments,
      Notes: selectedInvoice?.Notes || null,
      ReferenceCode: selectedInvoice?.ReferenceCode || uuid(),
      CashBookID: selectedInvoice?.CashBookID || null,
      CreatedDate: selectedInvoice?.CreatedDate || new Date(),
      Amounts: selectedInvoice?.NetTotalAfterTax ?? 0,
    };
  }

  retailInvoiceCreate(data: any) {

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
      Amount: payment.Amount ?? 0,
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
    return dataString;
  }

}
