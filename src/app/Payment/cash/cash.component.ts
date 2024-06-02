import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent {

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any, private salesInvoiceService: SalesInvoiceService) { }

  displayValue = '';
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
    if (this.displayValue != '') {

      let amountTemp = this.displayValue.toString();
      amountTemp += n;
      this.displayValue = (amountTemp);

    } else {
      this.displayValue = n;

    }
  }

  clearDisplay() {
    this.displayValue = '';
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  onConfirm() {
    try {
      let amount = parseFloat(this.displayValue);
      this.dialogRef.close(amount);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid amount!',
      });
    }
  }
}
