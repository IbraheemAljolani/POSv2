import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.css']
})
export class CashComponent {

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  displayValue = '';
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
