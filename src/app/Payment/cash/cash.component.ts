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

    displayValue = this.data.amount.toFixed(3);
    sysLabels: any = {};

    currentLanguage = this.salesInvoiceService.translationService.userInfo.languageId;

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

    numberOnly(event: KeyboardEvent): boolean {
        const charCode = event.which || event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46);
    }

    addNumber(n: string) {
        this.displayValue = this.displayValue ? this.displayValue + n : n;
    }

    clearDisplay() {
        this.displayValue = '';
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    onConfirm() {
        const amount = parseFloat(this.displayValue);
        if (!isNaN(amount)) {
            this.dialogRef.close(amount);
        } else {
            Swal.fire({
                icon: 'error',
                confirmButtonText: this.currentLanguage === 1 ? "OK" : "حسنا",
                title: this.currentLanguage === 1 ? 'Error' : 'خطأ',
                text: this.currentLanguage === 1 ? 'Please enter a valid amount' : 'الرجاء إدخال مبلغ صحيح',
            });
        }
    }
}
