import { Component, Input, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
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
    constructor(public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: SimpleLOVComponentData, private salesInvoiceService: SalesInvoiceService) { }

    searchID: number = 0;
    searchDescription: string = '';

    lookupRows: any[] = [];

    lookupRowFields: any[] = [];

    selectedItems: any[] = [];

    _baseUrl: string = this.salesInvoiceService.userInfo.baseUrl;

    sysLabels: any = {};

    currentLanguage = this.salesInvoiceService.userInfo.languageID;

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

    _loadCustomers(id: number, text?: string) {
        this.salesInvoiceService.getCustomers().subscribe((result: any) => {
            this.lookupRowFields = [
                this.currentLanguage === 1 ? 'ID' : 'الرقم',
                this.currentLanguage === 1 ? 'Description' : 'الاسم',
                this.currentLanguage === 1 ? 'Code' : 'الكود',
                this.currentLanguage === 1 ? 'Tel' : 'التليفون'
            ];
            let matchedSalesMen = [];
            for (let i = 0; i < result.length; i++) {
                if (result[i].CustID == id) {
                    matchedSalesMen.push(result[i]);
                }
            }

            var results = matchedSalesMen;

            if (results.length == 0) {
                results = result;
            }

            results = results.filter((item: any) => item.DescriptionEn.toLowerCase().includes((text ?? '').toLowerCase()));

            for (let i = 0; i < result.length; i++) {
                this.lookupRows.push([results[i].CustID, results[i].DescriptionEn, results[i].Code, results[i].Tel]);
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    _loadSalesMen(id?: number, text?: string) {
        this.salesInvoiceService.getLookups().subscribe((result: any) => {
            this.lookupRowFields = [
                this.currentLanguage === 1 ? 'ID' : 'الرقم',
                this.currentLanguage === 1 ? 'Description' : 'الاسم',
                this.currentLanguage === 1 ? 'SalesDivisionID' : 'القسم'
            ];
            let salesMen = result.SalesMans;
            let matchedSalesMen = [];
            for (let i = 0; i < salesMen.length; i++) {
                if (salesMen[i].ID == id) {
                    matchedSalesMen.push(salesMen[i]);
                }
            }

            salesMen = matchedSalesMen;

            if (salesMen.length == 0) {
                salesMen = result.SalesMans;
            }

            salesMen = salesMen.filter((item: any) => item.Description.toLowerCase().includes((text ?? '').toLowerCase()));

            for (let i = 0; i < salesMen.length; i++) {
                this.lookupRows.push([salesMen[i].ID, salesMen[i].Description, salesMen[i].SalesDivisionID]);
            }

        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    _loadPOS() {
        this.salesInvoiceService.getUserPOS().subscribe((result: any) => {
            this.lookupRowFields = [
                this.currentLanguage === 1 ? 'ID' : 'الرقم',
                this.currentLanguage === 1 ? 'Description' : 'الاسم',
                this.currentLanguage === 1 ? 'POSID' : 'الموقع'
            ];
            for (let i = 0; i < result.length; i++) {
                this.lookupRows.push([result[i].ID, result[i].POSDescription, result[i].PosID]);
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    // _loadProducts() {
    //     const params = { CompanyID: 1, "PageSize": this.pagination.PageSize, "SelectedPageNumber": this.pagination.SelectedPageNumber, SearchFilterQuery: this.filterText };
    //     this._http.post(this._baseUrl + `api/POS/FetchProudcts`, params).subscribe((result: any) => {
    //         this.inprocessing = false;

    //         // this._drawData(result);

    //     }, error => { this.inprocessing = false; this.loadingStatus = (error) ? error.Message || error : "Error"; console.error(error) });
    // }

    _loadDrillDownData() {
        this.salesInvoiceService.getProductsStock(this.data.SalesDivisionPOSID, this.data.productItem.ProductID).subscribe((result: any) => {
            this.lookupRowFields = [
                this.currentLanguage === 1 ? 'Code' : 'الكود',
                this.currentLanguage === 1 ? 'UOM Description' : 'الوحدة',
                this.currentLanguage === 1 ? 'Available Qty' : 'الكمية'
            ];
            for (let i = 0; i < result.length; i++) {
                this.lookupRows.push([result[i].Code, result[i].UOMDescription, result[i].DeviceAvailableQty]);
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    onSearchChange(id: number, text: string) {
        this.lookupRows = [];
        if (this.data.dataType === 'salesMen')
            this._loadSalesMen(id, text);
        else if (this.data.dataType === 'customers')
            this._loadCustomers(id, text);
    }


    _loadTargetData() {
        if (this.data.dataType === 'customers')
            this._loadCustomers(this.searchID);
        else if (this.data.dataType === 'salesMen')
            this._loadSalesMen(this.searchID);
        else if (this.data.dataType === 'POS')
            this._loadPOS();
        else if (this.data.dataType === "drillDown")
            this._loadDrillDownData();
        // else
        //     this._loadProducts();
    }

    ngOnInit() {
        this.Sys_Labels();
        console.log(this.currentLanguage);
        if (!this.data.idName)
            this.data.idName = "ID";

        this._loadTargetData();

    }
}