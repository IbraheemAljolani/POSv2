import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent {

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private salesInvoiceService: SalesInvoiceService
  ) { }

  amountCashnumber: string = this.data.amount.toFixed(3);
  barcode: string = '';
  couponAmount: number = 0;
  msg: string = '';
  getCoupon: any;

  @ViewChild("couponNumberRef", { static: false }) couponNumberElement: ElementRef | undefined;
  @ViewChild("amountNumberRef", { static: false }) amountNumberElement: ElementRef | undefined;

  focusedElement: ElementRef | undefined;

  sysLabels: any = {};

  currentLanguage = this.salesInvoiceService.translationService.userInfo.languageId ?? 1;

  ngOnInit(): void {
    this.Sys_Labels();
  }

  Sys_Labels() {
    this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
      result.forEach((label: any) => {
        this.sysLabels[label.LabelID.trim()] = label;
      });
    });
  }

  async getCoupons(): Promise<void> {
    try {
      this.getCoupon = await this.salesInvoiceService.getCoupons(this.barcode).toPromise();
      this.msg = '';
      this.couponAmount = this.getCoupon.RemainingAmount;
    } catch (error: any) {
      this.msg = error.error.Message
    }
  }

  checkCoupon() {
    this.getCoupons();
  }

  addNumber(n: string) {
    if (this.focusedElement === this.amountNumberElement) {
      this.amountCashnumber += n;
    } else if (this.focusedElement === this.couponNumberElement) {
      this.barcode += n;
    }
  }

  clearDisplay() {
    if (this.focusedElement === this.amountNumberElement) {
      this.amountCashnumber = '';
    } else if (this.focusedElement === this.couponNumberElement) {
      this.barcode = '';
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onConfirm() {
    const amount = parseFloat(this.amountCashnumber);
    if (amount > 0) {
      const finalAmount = amount;
      this.dialogRef.close({ finalAmount, cardNumber: this.barcode, methodID: this.data.methodID });
    } else {
      this.onCancel();
    }
  }
}
