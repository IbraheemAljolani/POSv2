import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromoAndMethodService {

  constructor() { }

  promoSelectAll(promoSelectAllFlag: boolean, promosList: any) {
    return promosList.forEach((promo: { SelectFlag: boolean; }) => promo.SelectFlag = promoSelectAllFlag);
  }

  addPayment(amount: number, cardNumber: string, receiptMethodTypeID: string, methodDetails: any, selectedPayments: any, methodID: number) {
    if (!selectedPayments) selectedPayments = [];

    const paymentIndex = selectedPayments.findIndex((payment: { ReceiptMethodID: number; }) => payment.ReceiptMethodID === methodID);

    if (paymentIndex >= 0) {
      selectedPayments[paymentIndex].Amount = amount;
    } else {
      selectedPayments.unshift({
        ReceiptMethodID: methodDetails.ID,
        ReceiptMethodTypeID: receiptMethodTypeID,
        Description: "",
        CardNumber: cardNumber,
        Amount: amount,
        SoldAmount: 0,
        invoiceDate: new Date()
      });
    }

    let selectedPaymentsData = [];
    selectedPaymentsData.push(methodDetails);
    return selectedPayments;
  }

  updateTotalAndPaidAmount(selectedPayments: any, selectedInvoice: any) {
    let totalAmount = selectedPayments.reduce((sum: any, payment: { Amount: any; }) => sum + payment.Amount, 0);
    let paidAmount = selectedInvoice.NetTotalAfterTax - totalAmount;

    return { totalAmount, paidAmount };
  }

  deletePayment(payment: any, selectedPayments: any[]): any[] {
    const paymentIndex = selectedPayments.findIndex((p: any) => p === payment);
    if (paymentIndex > -1) {
      selectedPayments.splice(paymentIndex, 1);
    }
    return selectedPayments;
  }

  updateTotalAmount(selectedPayments: any) {
    return selectedPayments.reduce((total: any, { Amount }: any) => total + Amount, 0);
  }
}
