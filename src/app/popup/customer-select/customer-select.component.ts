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

    constructor(public dialogRef: MatDialogRef<CustomerSelectComponent>, public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any, private salesInvoiceService: SalesInvoiceService
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

    currentLanguage = this.salesInvoiceService.userInfo.languageID;

    ngOnInit(): void {
        this.Sys_Labels();
        if (this.result) {
            this.parsedResult = JSON.parse(this.result);
            this.customerID = this.parsedResult[0];
            this.customerDescription = this.parsedResult[1];
        } else {
            this.customerID = this.data.DefaultCustomer.CustID ? this.data.DefaultCustomer.CustID : '---'
            this.customerDescription = this.data.DefaultCustomer.CustID ? this.data.DefaultCustomer.CustomerDescription : '---'
        }
    }

    Sys_Labels() {
        this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
            for (let i = 0; i < result.length; i++) {
                this.sysLabels[String(result[i].LabelID).trim()] = result[i];
            }
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