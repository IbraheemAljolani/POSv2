import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from 'src/app/Payment/card/card.component';
import { CashComponent } from 'src/app/Payment/cash/cash.component';
import { CustomerSelectComponent } from 'src/app/popup/customer-select/customer-select.component';
import { SimpleLOVComponent } from 'src/app/popup/simple-lov/simple-lov.component';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { v4 as uuid } from 'uuid';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(
        public dialog: MatDialog,
        private salesInvoiceService: SalesInvoiceService,
        @Inject(DOCUMENT) private document: any
    ) { }

    currentYear = new Date().getFullYear();
    version: string = '';
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
    message: string = '';
    datepicker = new Date().toISOString().slice(0, 10);
    filterRecallSearch: string[] = ['date'];
    retailInvoices: any = [];
    selectedInvoice: any;
    selectedInvoiceProducts: any = [];
    promoSelectAllFlag: boolean = false;
    openPromotion: boolean = false;
    promosList: any = [];
    receiptMethods: any = [];
    Amounts: number = 0.000;
    selectedPayments: any = [];
    addToCart: any = [];
    data: any;
    serviceCharge: boolean = false;
    selectedPaymentsData: any = [];
    totalAmount: number = 0.000;
    paidAmount: number = 0.000;
    salesManName: string = '';
    salesManID: number = 0;
    elem: any;
    isFullscreen = false;
    isDisabled = true;
    sysLabels: any = {};
    currentLanguage = this.salesInvoiceService.userInfo.languageId;

    private showDialog(icon: SweetAlertIcon, title: string, text: string) {
        const titles: { [key: string]: string } = { "Warning...": "تحذير...", "Oops...": "عذرا..." };
        const texts: { [key: string]: string } = {
            "Error in getting branch tables.": "خطأ في الحصول على الجداول الفرعية.",
        };

        Swal.fire({
            icon: icon,
            confirmButtonText: this.currentLanguage === 1 ? "OK" : "حسنا",
            title: this.currentLanguage === 1 ? title : titles[title],
            text: this.currentLanguage === 1 ? text : texts[text] || text,
        });
    }

    private showWarningDialog(errorMessage: string) {
        const languageSettings = this.getLanguageSettings(errorMessage);
        Swal.fire({
            icon: "question",
            confirmButtonText: languageSettings.confirmButtonText,
            title: languageSettings.title,
            text: languageSettings.text,
        });
    }

    private getLanguageSettings(errorMessage: string) {
        const messages: { [key: string]: string[] } = {
            branchTables: ["Error in getting branch tables.", "خطأ في الحصول على جداول الفروع."],
            userInfo: ["Error in getting user info.", "خطأ في الحصول على معلومات المستخدم."],
            invoice: ["Please select an invoice.", "الرجاء تحديد فاتورة."],
            categories: ["Error in getting categories.", "خطأ في الحصول على الفئات."],
            products: ["Error in getting products.", "خطأ في الحصول على المنتجات."],
            retailInvoices: ["Error in getting retail invoices.", "خطأ في الحصول على الفواتير التجزئة."],
            promotions: ["Error in getting promotions.", "خطأ في الحصول على العروض."],
            receiptMethods: ["Error in getting receipt methods.", "خطأ في الحصول على طرق الدفع."],
            alreadyPaid: ["Invoice is already paid.", "الفاتورة مدفوعة بالفعل."],
            creatingInvoice: ["Error in creating invoice.", "خطأ في إنشاء الفاتورة."],
            outOfStock: ["Product is out of stock.", "المنتج غير متوفر."],
            paidLessAmount: ["Paid amount is less than total amount.", "المبلغ المدفوع أقل من المبلغ الإجمالي."]
        };

        const defaultMsg = ["An unknown error occurred.", "حدث خطأ غير معروف."];
        const [en, ar] = messages[errorMessage] || defaultMsg;
        const textMessage = this.currentLanguage === 1 ? en : ar;

        return {
            confirmButtonText: this.currentLanguage === 1 ? "OK" : "حسنا",
            title: this.currentLanguage === 1 ? "Warning..." : "تحذير...",
            text: textMessage
        };
    }

    private showErrorDialog(errorMessage: string) {
        this.showDialog("error", "Oops...", errorMessage);
    }

    ngOnInit(): void {
        this.loadPackageVersion();
        this.getUserInfo();
        this.Sys_Labels();
        this.initializeFullScreenElement();
        this.loadCategories();
    }

    private loadPackageVersion(): void {
        const packageJson = require('../../package.json');
        this.version = packageJson.version;
    }

    private initializeFullScreenElement(): void {
        this.elem = document.documentElement;
    }

    private loadCategories(): void {
        let categories = sessionStorage.getItem('categories');
        if (categories) {
            this.categories = JSON.parse(categories);
        } else {
            this.getCategories();
        }
        this.loadInitialProducts();
    }

    private loadInitialProducts(): void {
        if (this.categories && this.categories.length > 0) {
            this.getProducts(this.categories[0].CategoryID);
        }
    }

    getColor(statusId: string): string {
        const statusColors: { [key: string]: string } = {
            'Created': '#6eb66e',
            'Printed': '#f1da91',
            'Under Delivery': '#96c7e7',
            'Void': '#f25022'
        };

        return statusColors[statusId as keyof typeof statusColors] || '';
    }

    Sys_Labels() {
        this.salesInvoiceService.Sys_Labels(this.currentLanguage).subscribe((result: any) => {
            result.forEach((label: { LabelID: any; }) => {
                this.sysLabels[String(label.LabelID).trim()] = label;
            });
        });

        const direction = this.currentLanguage === 1 ? 'ltr' : 'rtl';
        this.document.body.classList.remove('trio-' + (direction === 'ltr' ? 'rtl' : 'ltr'));
        this.document.body.classList.add('trio-' + direction);
        this.document.body.dir = direction;
    }

    changeLanguage() {
        this.currentLanguage = this.currentLanguage === 1 ? 2 : 1;
        this.salesInvoiceService.userInfo.languageId = this.currentLanguage;
        this.Sys_Labels();
        this.getUserInfo();
        this.getCategories();
        this.getRetailInvoices();
        this.getPromotions();
        this.getReceiptMethods();
    }

    toggleDropdownVisible() {
        this.isDropdownVisible = !this.isDropdownVisible;
        this.isDropdownInSession = sessionStorage.getItem('branchTables');

        if (!this.isDropdownVisible) {
            this.setBranchTablesFromSession();
            return;
        }

        if (this.isDropdownInSession) return;

        this.fetchAndStoreBranchTables();
    }

    private setBranchTablesFromSession() {
        this.branchTables = JSON.parse(this.isDropdownInSession);
    }

    private fetchAndStoreBranchTables() {
        this.salesInvoiceService.getBranchTables(this.userInfo.SalesDivision.SalesDivisionPosID).subscribe(
            result => this.handleBranchTablesResult(result),
            error => this.handleError(error)
        );
    }

    private handleBranchTablesResult(result: any) {
        if (result) {
            this.branchTables = result;
            sessionStorage.setItem('branchTables', JSON.stringify(result));
        } else {
            this.showWarningDialog("branchTables");
        }
    }

    private handleError(error: any) {
        this.showErrorDialog(error.error.Message);
    }

    goTab(tab: string) {
        this.activeInvoiceTab = tab;

        switch (tab) {
            case 'recall':
                this.getRetailInvoices();
                break;
            case 'promo':
                this.getPromotions();
                break;
            case 'cash':
                this.getReceiptMethods();
                break;
        }
    }

    getUserInfo() {
        this.salesInvoiceService.getUserInfo().subscribe({
            next: (result) => this.handleUserInfoResponse(result),
            error: (error) => this.showErrorDialog(error.error.Message)
        });
    }

    private handleUserInfoResponse(result: any) {
        if (result && typeof result === 'object') {
            this.userInfo = result;
        } else {
            this.showWarningDialog("userInfo");
        }
    }

    openPOSDialog() {
        const dialogRef = this.dialog.open(SimpleLOVComponent, {
            disableClose: true,
            maxHeight: '98%',
            width: "60%",
            minWidth: '300px',
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
            data: { dataType: "POS", isMultiCheck: false, title: "POS", idName: "POSID", selectedPOSID: this.userInfo.RetailUserPOS.SalesDivisionPOSID },
        });

        dialogRef.afterClosed().subscribe((result) => { });
    }

    openCustomerDialog() {

        if (!this.selectedInvoice) {
            this.showWarningDialog("invoice");
            return;
        }

        const dialogRef = this.dialog.open(CustomerSelectComponent, {
            disableClose: true,
            data: { title: "Customer", DefaultCustomer: this.userInfo.DefaultCustomer },
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;

            sessionStorage.setItem('selectCustomer', JSON.stringify(result.selectedCustomer));
            this.userInfo.DefaultCustomer.CustID = result.selectedCustomer[0];
            this.userInfo.DefaultCustomer.CustomerDescription = result.selectedCustomer[1];
        });
    }

    openMenuDrilldown(productItem: any): void {
        this.loading = true;
        this.salesInvoiceService.getProductsStock(this.userInfo.SalesDivision.SalesDivisionPosID, productItem.ProductID)
            .subscribe(stock => {
                if (stock[0]?.DeviceAvailableQty > 0) {
                    const dialogRef = this.dialog.open(SimpleLOVComponent, {
                        disableClose: true,
                        maxHeight: '98%',
                        width: "80%",
                        minWidth: '300px',
                        direction: this.currentLanguage === 1 ? "ltr" : "rtl",
                        data: { dataType: "drillDown", isMultiCheck: false, productItem: productItem, title: productItem.DescriptionEn + ' Qty', SalesDivisionPOSID: this.userInfo?.RetailUserPOS?.SalesDivisionPOSID },
                    });

                    dialogRef.afterClosed().subscribe((selectedResult) => {

                    });
                    this.loading = false;
                } else {
                    this.loading = false;
                    this.showWarningDialog("outOfStock");
                }
            });
    }

    selectSalesMan(): void {
        const dialogRef = this.dialog.open(SimpleLOVComponent, {
            disableClose: true,
            maxHeight: '98%',
            width: "70%",
            minWidth: '300px',
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
            data: { dataType: "salesMen", isMultiCheck: false, title: "Sales Man" },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) return;

            this.salesManID = result[0];
            this.salesManName = result[1];
        });
    }

    setTable(tbl: { ID: string; Description: string }): void {
        sessionStorage.setItem('selectedTable', JSON.stringify(tbl));
        this.selectedTable = `${tbl.ID} - ${tbl.Description}`;
        this.isDropdownVisible = false;
    }

    getCategories() {
        this.salesInvoiceService.getCategories().subscribe({
            next: (result: any) => {
                if (!result) {
                    this.showWarningDialog("categories");
                    return;
                }

                this.categories = result.filter((item: { CategoryParentID: number; }) => item.CategoryParentID === 0);
                sessionStorage.setItem('categories', JSON.stringify(this.categories));
                if (this.categories.length > 0) {
                    this.getProducts(this.categories[0].CategoryID);
                }
            },
            error: (error) => this.showErrorDialog(error.error.Message)
        });
    }

    getProducts(categoryID: number) {
        this.loading = true;
        this.searchProduct = '';
        this.newProducts = [];
        sessionStorage.setItem('selectedCategory', JSON.stringify(categoryID));

        this.salesInvoiceService.getProducts().subscribe({
            next: (result: any) => {
                this.handleProductResult(result, categoryID);
                this.loading = false;
            },
            error: (error) => {
                this.showErrorDialog(error.error.Message);
                this.loading = false;
            }
        });
    }

    private handleProductResult(result: any, categoryID: number) {
        if (result) {
            this.products = result.filter((item: { CategoryID: number; }) => item.CategoryID === categoryID);
            this.selectedCategory = sessionStorage.getItem('selectedCategory');
        } else {
            this.showWarningDialog("products");
        }
    }

    searchProducts(searchTerm: string) {
        this.loading = true;
        this.message = '';

        const descriptionKey = this.currentLanguage === 1 ? 'DescriptionEn' : 'DescriptionAr';
        this.newProducts = this.products.filter((product: { [x: string]: string; }) =>
            product[descriptionKey].toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (this.newProducts.length === 0) {
            this.message = this.currentLanguage === 1 ? "No products found." : "لم يتم العثور على منتجات.";
        }

        this.loading = false;
    }

    filters = [
        { label: 'Date', value: 'date', color: 'gray', checked: true },
        { label: 'Created', value: 'created', color: '#47bb47', checked: false },
        { label: 'Printed', value: 'printed', color: '#F1DA91', checked: false },
        { label: 'Void', value: 'rejected', color: '#f25022', checked: false },
    ];

    toggleFilter(filter: { checked: boolean; value: any; }): void {
        filter.checked = !filter.checked;
        this.filterRecallSearch = filter.checked
            ? [...this.filterRecallSearch, filter.value]
            : this.filterRecallSearch.filter(item => item !== filter.value);

        this.getRetailInvoices();
    }

    changeDate(date: Date): void {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        this.datepicker = nextDay.toISOString().split('T')[0];
        this.getRetailInvoices();
    }

    searchRecall(value: string) {
        if (value) {
            this.retailInvoices = this.retailInvoices.filter((item: { Code: string; ID: number; CustDescription: string }) => item.Code.includes(value) || item.ID.toString().includes(value) || item.CustDescription.includes(value));
        } else {
            this.getRetailInvoices();
        }
    }

    getRetailInvoices(): void {
        const posId = this.userInfo?.RetailUserPOS?.SalesDivisionPOSID;
        this.salesInvoiceService.getRetailInvoices(posId).subscribe({
            next: (result: any) => this.processInvoices(result),
            error: (error) => this.showErrorDialog(error.error.Message)
        });
    }

    private processInvoices(invoices: any[]): void {
        if (!invoices) {
            this.showWarningDialog("retailInvoices");
            return;
        }
        this.retailInvoices = this.filterRecallSearch.includes('date')
            ? this.filterByDate(invoices)
            : this.filterByStatus(invoices);
    }

    filterByDate(invoices: any[]): any[] {
        return invoices.filter(({ CreatedDate, SalesInvoiceStatusID }) => {
            const dateMatches = CreatedDate.slice(0, 10) === this.datepicker;
            const statusMatches = this.filterRecallSearch.length > 1
                ? SalesInvoiceStatusID && this.filterRecallSearch.includes(SalesInvoiceStatusID.toLowerCase())
                : true;
            return dateMatches && statusMatches;
        });
    }

    filterByStatus(invoices: any[]): any[] {
        return this.filterRecallSearch.length === 1
            ? invoices.filter(({ SalesInvoiceStatusID }) =>
                this.filterRecallSearch.includes(SalesInvoiceStatusID.toLowerCase())
            )
            : invoices;
    }

    invoiceDetails(invoice: any): void {
        this.resetInvoiceDetails();
        this.selectedInvoice = invoice;
        this.selectedInvoiceProducts = invoice.Products;
        this.addToCart.push(...this.selectedInvoiceProducts);
        this.activeInvoiceTab = 'invoice';
        this.paidAmount = invoice.NetTotalAfterTax;

        if (invoice.SalesInvoiceStatusID === "Printed") {
            this.processPrintedInvoice(invoice);
        }
    }

    private resetInvoiceDetails(): void {
        this.addToCart = [];
        this.selectedPayments = [];
    }

    private processPrintedInvoice(invoice: any): void {
        const payment = invoice.Payments[0];
        this.totalAmount = payment.CashReceiptAmount;
        this.paidAmount = payment.CashReturnedAmount;
        this.serviceCharge = invoice.ServiceCharge;

        this.selectedPayments.unshift({
            ReceiptMethodTypeID: payment.ReceiptMethodTypeID,
            Description: payment.DescriptionEn,
            Note: payment.Note,
            Amount: payment.Amount,
            SoldAmount: 0,
            invoiceDate: payment.PaymentDate
        });
    }

    updateProductQuantity(product: any, increment: boolean): void {
        const qtyChange = increment ? 1 : -1;
        if (!increment && product.Qty === 1) return;

        product.Qty += qtyChange;
        this.addToCart.forEach((item: any) => {
            if (item.ProductID === product.ProductID) {
                item.Qty = product.Qty;
            }
        });
        this.newInvoice(this.addToCart);
    }

    adjustInputWidth(event: KeyboardEvent, product: any): void {
        const inputElement = event.target as HTMLInputElement;
        inputElement.style.width = `${Math.max(inputElement.value.length + 1, 10) * 8}px`;

        this.updateCartQuantity(product.ProductID, inputElement.value);
        this.newInvoice(this.addToCart);
    }

    private updateCartQuantity(productId: number, quantity: string): void {
        this.addToCart.forEach((item: { ProductID: number; Qty: number; }) => {
            if (item.ProductID === productId) {
                item.Qty = parseInt(quantity, 10) || 0;
            }
        });
    }

    openDetails(product: { opened: boolean; }) {
        product.opened = !product.opened;
    }

    onCheckboxChange() {
        this.promoSelectAllFlag = !this.promoSelectAllFlag;
    }

    expandArea(item: { opened: boolean; }) {
        item.opened = !item.opened;
    }

    promoSelectAll() {
        this.promosList.forEach((item: { SelectFlag: boolean; }) => (item.SelectFlag = this.promoSelectAllFlag));
    }

    getPromotions() {
        this.salesInvoiceService.getPromotions().subscribe({
            next: (result: any) => {
                if (!result) {
                    this.showWarningDialog("promotions.");
                    return;
                }

                this.promosList = result;
            },
            error: (error) => { this.showErrorDialog(error.error.Message); }
        });
    }

    getReceiptMethods() {
        this.salesInvoiceService.getReceiptMethods().subscribe({
            next: (result: any) => {
                if (!result) {
                    this.showWarningDialog("receiptMethods.");
                    return;
                }
                this.receiptMethods = result;
            },
            error: (error) => { this.showErrorDialog(error.error.Message); }
        });

    }

    collectMethodDetails(methodType: string, description: string, methods: any): void {
        if (this.selectedInvoice.SalesInvoiceStatusID === 'Printed') {
            this.showWarningDialog("alreadyPaid");
            return;
        }

        switch (methodType) {
            case 'Cash':
                this._getCash(description, methodType, methods);
                break;
            case 'Card':
                this._getCard(description, methodType, methods);
                break;
            default:
                this.showWarningDialog("unsupportedMethod");
        }
    }

    _getCash(methodsType: string, ReceiptMethodTypeID: string, methods: any): void {
        const dialogRef = this.dialog.open(CashComponent, {
            disableClose: true,
            width: "300px",
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
            data: {
                dataType: "Cash",
                isMultiCheck: true,
                title: methodsType,
                image: methods.Image,
                amount: this.selectedInvoice.NetTotalAfterTax - this.totalAmount,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addPayment(result, ReceiptMethodTypeID, methods)
            }
        });
    }

    _getCard(methodsType: string, ReceiptMethodTypeID: string, methods: any): void {

        const dialogRef = this.dialog.open(CardComponent, {
            disableClose: true,
            width: "300px",
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
            data: {
                dataType: "Card",
                isMultiCheck: true,
                title: methodsType,
                image: methods.Image,
                amount: this.selectedInvoice.NetTotalAfterTax - this.totalAmount,
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.addPayment(result, ReceiptMethodTypeID, methods)
            }
        });
    }

    addPayment(amount: number, receiptMethodTypeID: string, methodDetails: any): void {
        if (!this.selectedPayments) this.selectedPayments = [];

        const paymentIndex = this.selectedPayments.findIndex((payment: { ReceiptMethodTypeID: string; }) => payment.ReceiptMethodTypeID === receiptMethodTypeID);

        if (paymentIndex >= 0) {
            this.selectedPayments[paymentIndex].Amount = amount;
        } else {
            this.selectedPayments.unshift({
                ReceiptMethodID: methodDetails.ID,
                ReceiptMethodTypeID: receiptMethodTypeID,
                Description: "",
                Amount: amount,
                SoldAmount: 0,
                invoiceDate: new Date()
            });
        }

        this.updateTotalAndPaidAmount();
        this.selectedPaymentsData.push(methodDetails);
    }

    private updateTotalAndPaidAmount(): void {
        this.totalAmount = this.selectedPayments.reduce((sum: any, payment: { Amount: any; }) => sum + payment.Amount, 0);
        this.paidAmount = this.selectedInvoice.NetTotalAfterTax - this.totalAmount;
    }

    deletePayment(payment: any): void {
        const paymentIndex = this.selectedPayments.findIndex((p: any) => p === payment);
        if (paymentIndex > -1) {
            this.selectedPayments.splice(paymentIndex, 1);
            this.updateTotalAmount();
        }
    }

    deleteProductFromCart(product: any): void {
        const productIndex = this.addToCart.findIndex((cartItem: { ProductID: any; }) => cartItem.ProductID === product.ProductID);
        if (productIndex !== -1) {
            this.addToCart.splice(productIndex, 1);
            this.refreshInvoice();
        }
    }

    private updateTotalAmount(): void {
        this.totalAmount = this.selectedPayments.reduce((total: any, { Amount }: any) => total + Amount, 0);
    }

    private refreshInvoice(): void {
        this.newInvoice(this.addToCart);
    }


    newInvoice(cart: any): void {
        const currentDate = new Date();
        const POSCode = this.generatePOSCode(currentDate);
        const tableID = this.getTableID();
        const customer = this.getCustomer();

        this.data = this.constructInvoiceData(cart, POSCode, tableID, customer, currentDate);

        this.salesInvoiceService.retailInvoice_Create(this.data).subscribe({
            next: (result: any) => this.processInvoiceCreationResult(result),
            error: (error) => this.showErrorDialog(error.error.Message)
        });
    }

    private generatePOSCode(currentDate: Date): string {
        return `${this.userInfo.SalesDivision.SalesDivisionID}/${this.userInfo.SalesDivision.SalesDivisionPosID}/${currentDate.getFullYear().toString().slice(-2)}/${currentDate.getMonth() + 1}-${Math.floor(Math.random() * 100)}`;
    }

    private getTableID(): string | null {
        const table = sessionStorage.getItem('selectedTable');
        return table ? JSON.parse(table).ID : null;
    }

    private getCustomer(): any {
        const customer = sessionStorage.getItem('selectCustomer');
        return customer ? JSON.parse(customer) : null;
    }

    private constructInvoiceData(cart: any, POSCode: string, tableID: string | null, customer: any, currentDate: Date): any {
        const invoiceDate = this.selectedInvoice?.SalesInvoiceDate ? new Date(this.selectedInvoice.SalesInvoiceDate) : new Date();
        const adjustedDate = new Date(invoiceDate.getTime() + 3 * 60 * 60 * 1000);
        return {
            Code: this.selectedInvoice?.Code || null,
            POSCode: this.selectedInvoice?.POSCode || POSCode,
            SalesInvoiceStatusID: this.selectedInvoice?.SalesInvoiceStatusID || 'Created',
            CustID: this.userInfo.DefaultCustomer.CustID,
            Description: customer ? customer[1] : null,
            CustDescription: customer ? customer[1] : null,
            ManualDiscountAmount: this.selectedInvoice?.ManualDiscountAmount || 0.0,
            DiscountPercentage: this.selectedInvoice?.DiscountPercentage || 0.0,
            TipAmount: this.selectedInvoice?.TipAmount || 0.0,
            TableID: tableID,
            ServiceCharge: this.serviceCharge ? 1 : 0,
            SalesDivisionPOSID: this.userInfo.RetailUserPOS.SalesDivisionPOSID || 0,
            RetailOrderReferenceCode: this.selectedInvoice?.RetailOrderReferenceCode || null,
            RetailOrderID: this.selectedInvoice?.RetailOrderID || null,
            SalesInvoiceDate: adjustedDate,
            Products: cart,
            Payments: this.selectedPayments,
            Notes: this.selectedInvoice?.Notes || null,
            ReferenceCode: this.selectedInvoice?.ReferenceCode || uuid(),
            CashBookID: this.selectedInvoice?.CashBookID || null,
            CreatedDate: this.selectedInvoice?.CreatedDate || new Date(),
            Amounts: this.selectedInvoice?.NetTotalAfterTax ?? 0,
        };
    }

    private processInvoiceCreationResult(result: any): void {
        if (result) {
            this.selectedInvoice = result;
            this.selectedInvoiceProducts = result.Products;
            this.userInfo.DefaultCustomer.CustomerDescription = result.CustDescription;
        } else {
            this.showWarningDialog("creatingInvoice");
        }
    }

    addItemOrGroup(product: any): void {
        this.loading = true;
        if (['Printed', 'Rejected'].includes(this.selectedInvoice?.SalesInvoiceStatusID)) return;

        let item = this.addToCart.find((item: { ProductID: any; }) => item.ProductID === product.ProductID);
        item ? item.Qty++ : this.addNewProductToCart(product);
        this.newInvoice(this.addToCart);
        this.goTab('invoice');
        this.loading = false;
    }

    private addNewProductToCart(product: any): void {
        const description = this.currentLanguage === 1 ? product.DescriptionEn : product.DescriptionAr;
        this.addToCart.push({
            ProductID: product.ProductID,
            TaxGroupID: product.TaxGroupID,
            UOMID: product.UOMID,
            Description: description,
            UOMDescription: description,
            ReturnedQty: 0,
            ReturnQty: 0,
            Qty: 1,
            RemainingQty: 1,
            SalesPrice: product.SalesPrice,
            Amount: product.SalesPrice,
            NetTotalBeforeDiscount: product.SalesPrice,
            TotalDiscount: 0,
            DiscountPercentage: 0,
            DiscountPerUnit: 0,
            NetTotalAfterDiscount: product.SalesPrice,
            TaxAmount: 0,
            TaxPercent: 0,
            NetTotalAfterTax: product.SalesPrice,
            Additions: [],
            Seriales: [],
            Batches: [],
            CurrencyID: this.userInfo?.CompanyInfo.CurrencyID,
            AppReferenceTransCode: uuid(),
            RetailOrderReferenceTransCode: "",
            Note: product.Note,
        });
    }

    postCash() {
        if (this.totalAmount >= this.selectedInvoice.NetTotalAfterTax) {
            this.newInvoice(this.addToCart);
            this.resetInvoiceState();
        } else {
            this.showWarningDialog("paidLessAmount");
        }
    }

    private resetInvoiceState(): void {
        this.selectedInvoice = null;
        this.selectedInvoiceProducts = [];
        this.addToCart = [];
        this.selectedPayments = [];
        this.totalAmount = 0;
        this.paidAmount = 0;
        this.activeInvoiceTab = 'invoice';
        sessionStorage.removeItem('selectCustomer');
        sessionStorage.removeItem('selectedTable');
        this.salesManID = 0;
        this.salesManName = '';
        this.selectedTable = '---';
    }

    addNewInvoice(): void {
        if (!this.selectedInvoice) return;
        this.resetInvoiceState();
    }

    RetailInvoice_Void() {
        if (this.selectedInvoice && this.selectedInvoice.SalesInvoiceStatusID === 'Created') {

            this.salesInvoiceService.RetailInvoice_Void(this.selectedInvoice.ID).subscribe((result) => {
                this.getRetailInvoices();
                this.resetInvoiceState();
            });
        }
    }

    toggleFullscreen(): void {
        this.isFullscreen ? this.closeFullscreen() : this.openFullscreen();
        this.isFullscreen = !this.isFullscreen;
    }

    private openFullscreen(): void {
        const requestMethods = [
            "requestFullscreen",
            "mozRequestFullScreen",
            "webkitRequestFullscreen",
            "msRequestFullscreen"
        ];
        requestMethods.forEach(method => {
            if (this.elem[method]) this.elem[method]();
        });
    }

    private closeFullscreen(): void {
        const exitMethods = [
            "exitFullscreen",
            "mozCancelFullScreen",
            "webkitExitFullscreen",
            "msExitFullscreen"
        ];
        exitMethods.forEach(method => {
            if ((document as any)[method]) (document as any)[method]();
        });
    }

    printPage(): void {
        const agreementSection = document.getElementById('agrrement-section');
        const printContents = agreementSection ? agreementSection.innerHTML : '';
        const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

        if (popupWin) {
            const htmlContent = `
            <html>
                <head>
                    <title>Print Document</title>
                    <style>
                        .center-text { display: flex; justify-content: center; font-size: 16px; font-weight: bold; }
                        .info-table { border: 1px solid #ccc; padding: 10px 20px; margin-top: 20px; width: 100%; }
                        .info-table td:first-child { width: 200px; }
                        .cashier-info { display: flex; justify-content: flex-end; }
                        table { width: 100%; border-collapse: collapse; }
                        thead th { border-bottom: 2px dotted #ccc; padding: 10px; text-align: left; }
                        tbody td { padding: 10px; text-align: left; }
                        .m-t-60 { margin-top: 60px; }
                    </style>
                </head>
                <body onload="window.print();window.close()">${printContents}</body>
            </html>
        `;
            popupWin.document.open();
            popupWin.document.write(htmlContent);
            popupWin.document.close();
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
