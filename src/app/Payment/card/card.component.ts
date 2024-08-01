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

    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private salesInvoiceService: SalesInvoiceService
    ) { }

    amountCashnumber: string = this.data.amount.toFixed(3);
    cardNumber: string = '';
    cardObj: any = [];

    @ViewChild("cardNumberRef", { static: false }) cardNumberElement: ElementRef | undefined;
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

    numberOnly(event: KeyboardEvent): boolean {
        const charCode = event.which ?? event.keyCode;
        return !(charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46);
    }

    addNumber(n: string) {
        if (this.focusedElement === this.amountNumberElement) {
            this.amountCashnumber += n;
        } else if (this.focusedElement === this.cardNumberElement) {
            this.cardNumber += n;
        }
    }

    formatCardNumber(event: any) {
        this.cardNumber = event.target.value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }

    clearDisplay() {
        if (this.focusedElement === this.amountNumberElement) {
            this.amountCashnumber = '';
        } else if (this.focusedElement === this.cardNumberElement) {
            this.cardNumber = '';
        }
    }

    onCancel() {
        this.dialogRef.close(null);
    }

    onConfirm() {
        const amount = parseFloat(this.amountCashnumber);
        if (amount > 0) {
            const finalAmount = amount;
            this.dialogRef.close({ finalAmount, cardNumber: this.cardNumber, methodID: this.data.methodID });
        } else {
            this.onCancel();
        }
    }
}
