import { Component, Input, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import { TranslationService } from 'src/app/services/translation.service';
import Swal from 'sweetalert2';

export class SimpleLOVComponentData {
    title: string = 'POS';
    dataType!: DataType;
    isMultiCheck: boolean = true;
    selectedItemID = 0;
    idName: string = "ID";
    drillDownDetails!: DrillDownDetails;
    selectedPOSID: number = 0;
    productItem: any;
    SalesDivisionPOSID: number = 0;
}

export enum DataType {
    customers = 'customers',
    products = 'products',
    salesMen = 'salesMen',
    POS = 'POS',
    drillDown = 'drillDown'
}

export interface DrillDownDetails {
    drillDownId: number,
    recordId: string,
    code: string
}


@Component({
    selector: 'app-simple-lov',
    templateUrl: './simple-lov.component.html',
    styleUrls: ['./simple-lov.component.css']
})

export class SimpleLOVComponent {
    constructor(
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: SimpleLOVComponentData,
        private salesInvoiceService: SalesInvoiceService,
    ) { }

    searchID: number = 0;
    searchDescription: string = '';

    lookupRows: any[] = [];

    lookupRowFields: any[] = [];

    selectedItems: any[] = [];

    _baseUrl: string = this.salesInvoiceService.translationService.userInfo.baseUrl;

    sysLabels: any = {};

    currentLanguage = this.salesInvoiceService.translationService.userInfo.languageId ?? 1;

    loadingStatus: string = 'Loading...';
    inprocessing: boolean = false;

    RecordsCount = 0;
    pagination = { PageSize: 1000, SelectedPageNumber: 1 };

    Sys_Labels() {
        this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
            for (let i = 0; i < result.length; i++) {
                this.sysLabels[String(result[i].LabelID).trim()] = result[i];
            }
        });
    }

    changePagination(args: any) {
        if (args && (this.pagination.PageSize != args.recordPerPage || this.pagination.SelectedPageNumber != args.pageNumber)) {
            this.pagination.PageSize = args.recordPerPage;
            this.pagination.SelectedPageNumber = args.pageNumber;
            this._loadTargetData();
        }
    }


    selectCustomer(item: any) {
        this.dialogRef.close(item);
    }


    removeItem(item: any) {
        const existedItem = this.selectedItems.find(i => i["ID"] === item["ID"]);
        if (existedItem)
            this.selectedItems.splice(this.selectedItems.indexOf(existedItem), 1);
    }


    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirmMultiChecked() {
        this.dialogRef.close(this.selectedItems);
    }

    localize(en: string, ar: string): string {
        return this.currentLanguage === 1 ? en : ar;
    }

    private handleError(error: any) {
        Swal.fire({
            icon: "error",
            confirmButtonText: this.localize("OK", "حسنا"),
            title: this.localize('Oops...', 'خطأ'),
            text: error?.error?.Message ?? 'An unexpected error occurred',
        });
    }

    _loadCustomers(id: number, text: string = '') {
        this.salesInvoiceService.getCustomers().subscribe({
            next: (result: any[]) => {
                this.lookupRowFields = this.buildLookupRowFields();

                const matchedSalesMen = result.filter(item =>
                    (item.CustID === id || !id) &&
                    item.DescriptionEn.toLowerCase().includes(text.toLowerCase())
                );

                this.lookupRows = this.buildLookupRows(matchedSalesMen);
            },
            error: (error) => this.handleError(error)
        });
    }

    private buildLookupRowFields() {
        return [
            this.localize('ID', 'الرقم'),
            this.localize('Description', 'الاسم'),
            this.localize('Code', 'الكود'),
            this.localize('Tel', 'التليفون')
        ];
    }

    private buildLookupRows(matchedSalesMen: any[]) {
        return matchedSalesMen.map(({ CustID, DescriptionEn, Code, Tel }) =>
            [CustID, DescriptionEn, Code, Tel]
        );
    }

    _loadSalesMen(id?: number, text?: string) {
        this.salesInvoiceService.getLookups().subscribe({
            next: (result: any) => this.processSalesMen(result, id, text),
            error: (error) => this.handleError(error)
        });
    }

    private processSalesMen(result: any, id?: number, text?: string) {
        this.lookupRowFields = this.getLookupRowFields();
        let salesMen = this.filterSalesMenById(result.SalesMans, id);

        if (salesMen.length === 0) {
            salesMen = result.SalesMans;
        }

        salesMen = this.filterSalesMenByText(salesMen, text);
        this.populateLookupRows(salesMen);
    }

    private getLookupRowFields() {
        return [
            this.localize('ID', 'الرقم'),
            this.localize('Description', 'الاسم'),
            this.localize('SalesDivisionID', 'القسم')
        ];
    }

    private filterSalesMenById(salesMen: any[], id?: number) {
        return salesMen.filter(salesMan => salesMan.ID === id);
    }

    private filterSalesMenByText(salesMen: any[], text?: string) {
        return salesMen.filter(salesMan => salesMan.Description.toLowerCase().includes((text ?? '').toLowerCase()));
    }

    private populateLookupRows(salesMen: any[]) {
        this.lookupRows = salesMen.map(salesMan => [salesMan.ID, salesMan.Description, salesMan.SalesDivisionID]);
    }

    _loadPOS() {
        this.salesInvoiceService.getUserPOS().subscribe({
            next: (result: any) => {
                this.lookupRowFields = this.getPOSRowFields();
                this.populatePOSRows(result);
            },
            error: (error) => this.handleError(error)
        });
    }

    private getPOSRowFields() {
        return [
            this.localize('ID', 'الرقم'),
            this.localize('Description', 'الاسم'),
            this.localize('POSID', 'الموقع')
        ];
    }

    private populatePOSRows(posList: any[]) {
        this.lookupRows = posList.map(pos => [pos.ID, pos.POSDescription, pos.PosID]);
    }

    _loadDrillDownData() {
        this.salesInvoiceService.getProductsStock(this.data.SalesDivisionPOSID, this.data.productItem.ProductID).subscribe({
            next: (result: any) => this.processProductStock(result),
            error: (error) => this.handleError(error)
        });
    }

    private processProductStock(result: any) {
        this.lookupRowFields = this.getStockRowFields();
        this.lookupRows = result.map((item: { Code: any; UOMDescription: any; DeviceAvailableQty: any; }) => [item.Code, item.UOMDescription, item.DeviceAvailableQty]);
    }

    private getStockRowFields() {
        return [
            this.localize('Code', 'الكود'),
            this.localize('UOM Description', 'الوحدة'),
            this.localize('Available Qty', 'الكمية')
        ];
    }

    onSearchChange(id: number, text: string) {
        this.lookupRows = [];
        if (this.data.dataType === 'salesMen')
            this._loadSalesMen(id, text);
        else if (this.data.dataType === 'customers')
            this._loadCustomers(id, text);
    }


    _loadTargetData() {
        switch (this.data.dataType) {
            case 'customers':
                this._loadCustomers(this.searchID);
                break;
            case 'salesMen':
                this._loadSalesMen(this.searchID);
                break;
            case 'POS':
                this._loadPOS();
                break;
            case 'drillDown':
                this._loadDrillDownData();
                break;
            default:
                console.error('Invalid data type');
        }
    }

    ngOnInit() {
        this.Sys_Labels();
        if (!this.data.idName)
            this.data.idName = "ID";

        this._loadTargetData();

    }
}