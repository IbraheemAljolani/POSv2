import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from 'src/app/Payment/card/card.component';
import { CashComponent } from 'src/app/Payment/cash/cash.component';
import { CustomerSelectComponent } from 'src/app/popup/customer-select/customer-select.component';
import { SimpleLOVComponent } from 'src/app/popup/simple-lov/simple-lov.component';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-sales-invoice',
    templateUrl: './sales-invoice.component.html',
    styleUrls: ['./sales-invoice.component.css']
})
export class SalesInvoiceComponent {

    constructor(public dialog: MatDialog, private salesInvoiceService: SalesInvoiceService) { }

    activeInvoiceTab = 'invoice';
    isDropdownVisible = false;
    branchTables: any = [];
    isDropdownInSession: any;
    userInfo: any = [];
    categories: any = [];
    products: any = [];
    selectedTable: string = '---';
    loading: boolean = false;
    selectedCategory: any;
    searchProduct: string = '';
    newProducts: any = [];
    languageID = this.salesInvoiceService.userInfo.languageID;
    message: string = '';
    datepicker = new Date();
    filterRecallSearch: string[] = ['date'];
    retailInvoices: any = [];
    originalRetailInvoices: any[] = [];
    selectedInvoice: any;
    selectedInvoiceProducts: any = [];
    openProductDetails: boolean = false;
    promoSelectAllFlag: boolean = false;
    openPromotion: boolean = false;
    promosList: any = [];
    receiptMethods: any = [];
    Amounts: any;
    selectedPayments: any;
    addToCart: any = [];

    public totals = {
        TotalPay: 0,
        NetTotal: 0,
        RemainingTotal: 0,
        DiscountTotal: 0,
        TotalTax: 0,
    };

    ngOnInit(): void {
        this.getUserInfo();

        let categories = sessionStorage.getItem('categories');
        if (categories) {
            this.categories = JSON.parse(categories);
        } else {
            this.getCategories();
        }
        if (this.categories && this.categories.length > 0) {
            this.getProducts(this.categories[0].CategoryID);
        }
    }

    getColor(statusId: string): string {
        switch (statusId) {
            case 'Created':
                return '#6eb66e';
            case 'Printed':
                return '#f1da91';
            case 'Under Delivery':
                return '#96c7e7';
            case 'Void':
                return '#f25022';
            default:
                return '';
        }
    }

    getDescription(item: any, enProp: string, arProp: string) {
        return this.languageID === 1 ? item[enProp] : item[arProp];
    }

    toggleDropdownVisible() {
        this.isDropdownVisible = !this.isDropdownVisible;
        this.isDropdownInSession = sessionStorage.getItem('branchTables');
        if (this.isDropdownVisible && !this.isDropdownInSession) {
            this.salesInvoiceService.getBranchTables(this.userInfo.SalesDivision.SalesDivisionPosID).subscribe((result: any) => {
                if (result) {
                    this.branchTables = result;
                    sessionStorage.setItem('branchTables', JSON.stringify(result));
                } else {
                    Swal.fire({
                        icon: "question",
                        title: "Warning...",
                        text: "Error in getting branch tables.",
                    });
                }
            });
        } else {
            this.branchTables = JSON.parse(this.isDropdownInSession);
        }
    }

    goTab(tab: string) {
        this.activeInvoiceTab = tab;

        if (tab === 'recall') {
            this.getRetailInvoices(this.filterRecallSearch);
        }

        if (tab === 'promo') {
            this.getPromotions();
        }

        if (tab === 'cash') {
            this.getReceiptMethods();
        }
    }

    getUserInfo() {
        this.salesInvoiceService.getUserInfo().subscribe((result: any) => {
            if (result) {
                this.userInfo = result;
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting user info.",
                });
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    openPOSDialog() {
        const dialogRef = this.dialog.open(SimpleLOVComponent, {
            disableClose: true,
            maxHeight: '98%',
            width: "60%",
            minWidth: '300px',
            direction: "ltr",
            data: { dataType: "POS", isMultiCheck: false, title: "POS", idName: "POSID", selectedPOSID: this.userInfo.RetailUserPOS.SalesDivisionPOSID },
        });

        dialogRef.afterClosed().subscribe((result) => {
            //   dialogRef.componentInstance.data = null;
        });
    }

    openCustomerDialog() {
        const dialogRef = this.dialog.open(CustomerSelectComponent, {
            disableClose: true,
            data: { title: "Set Customer", DefaultCustomer: this.userInfo.DefaultCustomer },
            direction: "ltr",
        });

        dialogRef.afterClosed().subscribe((result) => {
            let results = sessionStorage.getItem('selectCustomer');
            if (results) {
                let parsedResult = JSON.parse(results);
                this.userInfo.DefaultCustomer.CustID = parsedResult[0];
                this.userInfo.DefaultCustomer.CustomerDescription = parsedResult[1];
            }
        });
    }

    setTable(tbl: any) {
        sessionStorage.setItem('selectedTable', JSON.stringify(tbl));
        this.selectedTable = `${tbl.ID} - ${tbl.Description}`;
        this.isDropdownVisible = false;
    }

    clickedOutsideTable(): void {
        this.isDropdownVisible = false;
    }

    getCategories() {
        this.salesInvoiceService.getCategories().subscribe((result: any) => {
            if (result) {
                this.categories = result.filter((item: { CategoryParentID: number; }) => item.CategoryParentID === 0);
                sessionStorage.setItem('categories', JSON.stringify(this.categories));
                if (this.categories.length > 0) {
                    if (this.categories && this.categories.length > 0) {
                        this.getProducts(this.categories[0].CategoryID);
                    }
                }
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting categories.",
                });
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    getProducts(categoryID: number) {
        this.loading = true;
        this.searchProduct = '';
        this.newProducts = [];
        sessionStorage.setItem('selectedCategory', JSON.stringify(categoryID));
        this.salesInvoiceService.getProducts().subscribe((result: any) => {
            if (result) {
                this.products = result.filter((item: { CategoryID: number; }) => item.CategoryID === categoryID);
                this.selectedCategory = sessionStorage.getItem('selectedCategory');
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting products.",
                });
            }
            this.loading = false;
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
            this.loading = false;
        });
    }

    async searchProducts(searchProduct: string) {
        this.loading = true;

        this.newProducts = this.products.filter((product: { DescriptionEn: any; DescriptionAr: any; }) =>
            (this.languageID === 1 ? product.DescriptionEn : product.DescriptionAr).toLowerCase().includes(searchProduct.toLowerCase())
        );

        if (this.newProducts.length === 0) {
            this.message = 'No products found in this category.';
        }

        this.loading = false;
    }

    filters = [
        { label: 'Date', value: 'date', color: 'gray', checked: true },
        { label: 'Created', value: 'created', color: '#47bb47', checked: false },
        { label: 'Printed', value: 'printed', color: '#F1DA91', checked: false },
        { label: 'Under Delivery', value: 'underDelivery', color: '#96c7e7', checked: false },
        { label: 'Void', value: 'void', color: '#f25022', checked: false },
    ];

    toggleFilter(filter: { checked: boolean; value: any; }): void {
        filter.checked = !filter.checked;
        if (filter.checked) {
            this.filterRecallSearch.push(filter.value);
        } else {
            this.filterRecallSearch = this.filterRecallSearch.filter(item => item !== filter.value);
        }
        this.getRetailInvoices(this.filterRecallSearch);
    }

    getRetailInvoices(filterRecallSearch: string[]) {
        this.salesInvoiceService.getRetailInvoices(this.userInfo.RetailUserPOS.SalesDivisionPOSID).subscribe((result: any) => {
            if (result) {
                this.retailInvoices = result.filter((item: { SalesInvoiceStatusID: string; }) => filterRecallSearch.includes(item.SalesInvoiceStatusID.toLowerCase()));

                this.originalRetailInvoices = (this.retailInvoices && this.retailInvoices.length > 0) ? this.retailInvoices : result;
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting retail invoices.",
                });
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    changeDate(date: any) {
        date.setDate(date.getDate() + 1);
        this.datepicker = date.toISOString().slice(0, 10);
        this.getRetailInvoices(this.filterRecallSearch);
    }

    searchRecall(value: string) {
        this.retailInvoices = this.originalRetailInvoices.filter((item: { ID: string; Code: string; CustDescription: string; }) =>
            item.ID.toString().includes(value) || item.Code.includes(value) || item.CustDescription.includes(value));
    }

    invoiceDetails(invoice: any) {
        this.selectedInvoice = invoice;
        this.selectedInvoiceProducts = this.selectedInvoice.Products;
        this.activeInvoiceTab = 'invoice';

        if (invoice.SalesInvoiceStatusID === "Printed") {
            if (!this.selectedPayments) {
                this.selectedPayments = [];
            }

            this.selectedPayments = [];

            this.selectedPayments.unshift({
                // ReceiptMethodID: methodID,
                ReceiptMethodTypeID: invoice.Payments[0].ReceiptMethodTypeID,
                Description: invoice.Payments[0].DescriptionEn,
                Note: invoice.Payments[0].Note,
                Amount: invoice.Payments[0].Amount,
                SoldAmount: 0,
                invoiceDate: invoice.Payments[0].PaymentDate
            });
        }

    }

    increaseQty(product: any) {
        product.Qty++;
    }

    decreaseQty(product: any) {
        if (product.Qty > 0) {
            product.Qty--;
        }
    }

    adjustInputWidth(event: KeyboardEvent) {
        const inputElement = event.target as HTMLInputElement;
        inputElement.style.width = ((inputElement.value.length + 10) * 8) + 'px';
    }

    openDetails() {
        this.openProductDetails = !this.openProductDetails;
    }

    onCheckboxChange() {
        this.promoSelectAllFlag = !this.promoSelectAllFlag;
    }

    promoSelectAll() {
        this.promosList.forEach((item: { SelectFlag: boolean; }) => (item.SelectFlag = this.promoSelectAllFlag));
    }

    expandArea(item: { opened: boolean; }) {
        item.opened = !item.opened;
    }

    getPromotions() {
        this.salesInvoiceService.getPromotions().subscribe((result: any) => {
            if (result) {
                this.promosList = result;
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting promos.",
                });
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });
    }

    getReceiptMethods() {
        this.salesInvoiceService.getReceiptMethods().subscribe((result: any) => {
            if (result) {
                this.receiptMethods = result;
            } else {
                Swal.fire({
                    icon: "question",
                    title: "Warning...",
                    text: "Error in getting receipt methods.",
                });
            }
        }, (error) => {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.error.Message,
            });
        });

    }

    collectMethodDetails(methodsType: string, discreption: string) {
        if (this.selectedInvoice.SalesInvoiceStatusID === 'Printed') {
            Swal.fire({
                icon: "warning",
                title: "Warning...",
                text: "You can't add another payment method for this invoice.",
            });
            return;
        }
        if (methodsType === 'Cash') {
            this._getCash(discreption, methodsType);
        } else if (methodsType === 'Card') {
            this._getCard(discreption, methodsType);
        }
    }

    _getCash(methodsType: string, ReceiptMethodTypeID: string): void {
        const dialogRef = this.dialog.open(CashComponent, {
            disableClose: true,
            direction: "ltr",
            data: {
                dataType: "Cash",
                isMultiCheck: true,
                title: methodsType,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addPayment(result, ReceiptMethodTypeID)
            }
        });
    }

    _getCard(methodsType: string, ReceiptMethodTypeID: string): void {

        const dialogRef = this.dialog.open(CardComponent, {
            disableClose: true,
            width: "300px",
            direction: "ltr",
            data: {
                dataType: "Card",
                isMultiCheck: true,
                title: methodsType,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addPayment(result, ReceiptMethodTypeID)
            }
        });
    }

    addPayment(amount: number, ReceiptMethodTypeID: string) {

        if (!this.selectedPayments) {
            this.selectedPayments = [];
        }
        this.selectedPayments = [];

        this.selectedPayments.unshift({
            // ReceiptMethodID: methodID,
            ReceiptMethodTypeID: ReceiptMethodTypeID,
            Description: "",//paymentName + " payment for invoice " + this.invoiceData.invoiceID,
            Amount: amount,
            SoldAmount: 0,
            invoiceDate: new Date()
        });

    }

    deleteCash(item: any) {
        if (this.doesInvoiceStatusDisallow()) return;

        this.selectedPayments.splice(this.selectedPayments.indexOf(item), 1);
    }

    doesInvoiceStatusDisallow(): boolean {
        return (this.retailInvoices.SalesInvoiceStatusID !== "Created");
    }

    newInvoice() {
        this.openCustomerDialog();
        this.selectedInvoice = { SalesInvoiceDate: new Date() };
    }

    addItemOrGroup(product: any) {
        if (this.selectedInvoice) {
            this.addToCart.push(product);
        }
    }

    ngOnDestroy() {
        sessionStorage.removeItem('branchTables');
        sessionStorage.removeItem('categories');
        sessionStorage.removeItem('selectCustomer');
        sessionStorage.removeItem('selectedTable');
        sessionStorage.removeItem('selectedCategory');
    }

}
