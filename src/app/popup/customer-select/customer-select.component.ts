import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SimpleLOVComponent } from '../simple-lov/simple-lov.component';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';

@Component({
    selector: 'app-customer-select',
    templateUrl: './customer-select.component.html',
    styleUrls: ['./customer-select.component.css']
})
export class CustomerSelectComponent {

    constructor(
        public dialogRef: MatDialogRef<CustomerSelectComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private salesInvoiceService: SalesInvoiceService,
    ) { }

    parsedResult: any;
    customerID: string = '---';
    loyaltyCard: string = '---';
    totalPoints: number = 0;
    usedPoints: number = 0;
    loyaltyPoints: number = 0;
    loyaltyValue: number = 0;
    customerDescription: string = '---';
    result = sessionStorage.getItem('selectCustomer');
    selectedCustomer: any;

    sysLabels: any = {};

    currentLanguage = this.salesInvoiceService.translationService.userInfo.languageId;

    ngOnInit(): void {
        this.Sys_Labels();
        this.initializeCustomerDetails();
    }

    private initializeCustomerDetails(): void {
        if (this.result) {
            const [customerID, customerDescription] = JSON.parse(this.result);
            this.customerID = customerID;
            this.customerDescription = customerDescription;
        } else {
            this.customerID = this.data.defaultCustomer.CustID || '---';
            this.customerDescription = this.data.defaultCustomer.CustomerDescription || '---';
        }
    }

    Sys_Labels(): void {
        this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
            result.forEach((label: any) => {
                this.sysLabels[label.LabelID.trim()] = label;
            });
        });
    }

    openSearchDialog(): void {
        const dialogRef = this.dialog.open(SimpleLOVComponent, {
            disableClose: true,
            width: '70%',
            direction: "ltr",
            data: { dataType: "customers", isMultiCheck: false, title: "Customers" },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.selectedCustomer = result;
                this.customerID = result[0];
                this.customerDescription = result[1];
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirmMultiChecked() {
        this.dialogRef.close({ selectedCustomer: this.selectedCustomer });
    }
}