import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any, private salesInvoiceService: SalesInvoiceService) { }

  amountCashnumber: string = '';
  cardNumber: string = '';
  cardObj: any = [];

  @ViewChild("cardNumberRef", { static: false }) cardNumberElement: ElementRef | undefined;
  @ViewChild("amountNumberRef", { static: false }) amountNumberElement: ElementRef | undefined;

  focusedElement: ElementRef | undefined;

  sysLabels: any = {};

  currentLanguage = this.salesInvoiceService.userInfo.languageID;

  ngOnInit(): void {
    this.Sys_Labels();
  }

  Sys_Labels() {
    this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
      for (let i = 0; i < result.length; i++) {
        this.sysLabels[String(result[i].LabelID).trim()] = result[i];
      }
    });
  }

  numberOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
      return false;
    }
    return true;
  }

  addNumber(n: string) {
    if (this.focusedElement == this.amountNumberElement) {
      let amountTemp = String(this.amountCashnumber);
      amountTemp += n;
      this.amountCashnumber = (amountTemp);
    } else if (this.focusedElement == this.cardNumberElement) {
      let amountTemp = String(this.cardNumber);
      amountTemp += n;
      this.cardNumber = (amountTemp);
    }
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16);
    let formattedInput = '';

    for (let i = 0; i < input.length; i++) {
      if (i !== 0 && i % 4 === 0) {
        formattedInput += ' ';
      }
      formattedInput += input[i];
    }

    this.cardNumber = formattedInput;
  }

  clearDisplay() {
    if (this.focusedElement == this.amountNumberElement) {
      this.amountCashnumber = '';
    } else if (this.focusedElement == this.cardNumberElement) {
      this.cardNumber = '';
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onConfirm() {
    try {
      let amount = parseFloat(this.amountCashnumber);
      if (amount > 0) {
        if (this.data && this.data.totals && amount > (+this.data.totals.RemainingTotal))
          amount = this.data.totals.RemainingTotal;

        this.dialogRef.close(amount);
      } else
        this.onCancel();

    } catch (err) {
      Swal.fire({
        icon: 'error',
        confirmButtonText: this.currentLanguage === 1 ? "OK" : "حسنا",
        title: this.currentLanguage == 1 ? 'Error' : 'خطأ',
        text: this.currentLanguage == 1 ? 'Please enter a valid amount' : 'الرجاء إدخال مبلغ صحيح',
      });
    }
  }
}
