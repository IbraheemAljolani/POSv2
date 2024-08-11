import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from 'src/app/Payment/card/card.component';
import { CashComponent } from 'src/app/Payment/cash/cash.component';
import { CustomerSelectComponent } from 'src/app/popup/customer-select/customer-select.component';
import { SimpleLOVComponent } from 'src/app/popup/simple-lov/simple-lov.component';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import { ComponentType } from '@angular/cdk/portal';
import { firstValueFrom } from 'rxjs';
import { CouponComponent } from './Payment/coupon/coupon.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    currentYear = new Date().getFullYear();
    version: string = '';
    activeInvoiceTab = 'invoice';
    isDropdownVisible = false;
    branchTables: any = [];
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
    promosList: any = [];
    receiptMethods: any = [];
    selectedPayments: any = [];
    addToCart: any = [];
    data: any;
    serviceCharge: boolean = false;
    selectedPaymentsData: any = [];
    totalAmount: number = 0.000;
    paidAmount: number = 0.000;
    salesManName: string = '';
    salesManID: number = 0;
    isFullscreen = false;
    isDisabled = true;
    sysLabels: any = {};
    stockProducts: any = [];
    productItem: any;
    filters = [
        { label: 'Date', value: 'date', color: 'gray', checked: true },
        { label: 'Created', value: 'created', color: '#47bb47', checked: false },
        { label: 'Printed', value: 'printed', color: '#F1DA91', checked: false },
        { label: 'Void', value: 'rejected', color: '#f25022', checked: false },
    ];

    currentLanguage = 1;


    constructor(
        public dialog: MatDialog,
        public salesInvoiceService: SalesInvoiceService,
    ) { }

    goTab(tab: string) {
        this.activeInvoiceTab = tab;
        const actions: { [key: string]: () => void } = {
            'recall': () => this.getRetailInvoices(),
            'promo': () => this.getPromotions(),
            'cash': () => this.getReceiptMethods(),
        };
        actions[tab]?.();
    }

    ngOnInit(): void {
        this.loading = true;
        this.version = this.salesInvoiceService.initService.loadPackageVersion();
        this.currentLanguage = this.salesInvoiceService?.translationService?.userInfo?.languageId ?? 1;
        this.loadInitialData();
    }

    private loadInitialData(): void {
        this.loadCategories();
        this.getUserInfo();
        this.Sys_Labels();
    }

    private loadCategories(): void {
        this.categories = this.salesInvoiceService.initService.loadCategories() ?? this.getCategories();
        this.categories = Array.isArray(this.categories) ? this.categories : [];
        if (this.categories.length > 0) {
            this.getProducts(this.categories[0].CategoryID);
        }
    }

    changeLanguage(): void {
        this.currentLanguage = this.currentLanguage === 1 ? 2 : 1;
        this.updateUIForNewLanguage();
    }

    private updateUIForNewLanguage(): void {
        this.loadInitialData();
        this.getRetailInvoices();
        this.getPromotions();
        this.getReceiptMethods();
    }

    async Sys_Labels(): Promise<void> {
        const result = await this.salesInvoiceService.Sys_Labels(this.currentLanguage).toPromise();
        result.forEach((label: { LabelID: any; }) => {
            this.sysLabels[String(label.LabelID).trim()] = label;
        });

        this.salesInvoiceService.initService.updateDocumentDirection(this.currentLanguage);
    }

    toggleDropdownVisibility(): void {
        const [branchTables, isDropdownVisible] = this.salesInvoiceService.branchTablesService.toggleDropdownVisibility(this.isDropdownVisible);
        this.isDropdownVisible = isDropdownVisible;
        this.branchTables = branchTables ?? this.retrieveAndStoreBranchTables();
    }

    async retrieveAndStoreBranchTables(): Promise<void> {
        if (this.userInfo?.SalesDivision?.SalesDivisionPosID) {
            try {
                const result = await this.salesInvoiceService.getBranchTables(this.userInfo.SalesDivision.SalesDivisionPosID).toPromise();
                if (result) {
                    this.branchTables = this.salesInvoiceService.branchTablesService.handleBranchTablesResult(result);
                } else {
                    this.salesInvoiceService.alertPopupService.showWarningDialog("branchTables");
                }
            } catch (error: any) {
                this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
            }
        }
    }

    async getUserInfo(): Promise<void> {
        try {
            const result = await this.salesInvoiceService.getUserInfo().toPromise();
            if (result && typeof result === 'object') {
                this.userInfo = result;
            } else {
                this.salesInvoiceService.alertPopupService.showWarningDialog("userInfo");
            }
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }



    async openDynamicDialog(dialogType: string): Promise<void> {
        let dialogConfig = this.salesInvoiceService.dialogService.getDialogConfig(dialogType, this.userInfo, this.productItem);

        if (dialogType === 'customer' || dialogType === 'salesMan') {
            const componentType = dialogType === 'customer' ? CustomerSelectComponent : SimpleLOVComponent;
            const dialogRef = this.dialog.open(componentType as ComponentType<CustomerSelectComponent>, dialogConfig);

            const result = await dialogRef.afterClosed().toPromise();
            if (!result) return;

            if (dialogType === 'customer') {
                const updatedCustomer = this.salesInvoiceService.dialogService.updateDefaultCustomer(result.selectedCustomer);
                this.userInfo.DefaultCustomer = { ...this.userInfo.DefaultCustomer, ...updatedCustomer };
            } else {
                [this.salesManID, this.salesManName] = result;
            }
        } else {
            this.dialog.open(SimpleLOVComponent, dialogConfig);
        }
    }

    // async openMenuDrilldown(productItem: any): Promise<void> {
    //     this.loading = true;
    //     try {
    //         const stock = await this.salesInvoiceService.getProductsStock(this.userInfo.SalesDivision.SalesDivisionPosID, productItem.ProductID).toPromise();
    //         this.loading = false;
    //         if (stock[0]?.DeviceAvailableQty > 0) {
    //             this.productItem = productItem;
    //             await this.openDynamicDialog('productsStock');
    //         } else {
    //             this.salesInvoiceService.alertPopupService.showWarningDialog("outOfStock");
    //         }
    //     } catch (error: any) {
    //         this.loading = false;
    //         this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
    //     }
    // }

    setSelectedTable(table: { ID: string; Description: string }): void {
        sessionStorage.setItem('selectedTable', JSON.stringify(table));
        this.selectedTable = `${table.ID} - ${table.Description}`;
        this.isDropdownVisible = false;
    }

    async getCategories() {
        this.loading = true;
        try {
            const result = await this.salesInvoiceService.getCategories().toPromise();
            this.loading = false;
            if (!result || result.length === 0) {
                this.salesInvoiceService.alertPopupService.showWarningDialog("categories");
                return;
            }

            this.categories = result.filter((item: { CategoryParentID: number; }) => item.CategoryParentID === 0);
            sessionStorage.setItem('categories', JSON.stringify(this.categories));

            if (this.categories.length > 0) {
                await this.getProducts(this.categories[0].CategoryID);
            }
        } catch (error: any) {
            this.loading = false;
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }

    async getProducts(categoryID: number): Promise<void> {
        this.initializeProductLoading();
        sessionStorage.setItem('selectedCategory', JSON.stringify(categoryID));

        try {
            const result = await this.salesInvoiceService.getProducts().toPromise();
            this.getProductStock();
            this.handleProductResult(result, categoryID);
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error?.error?.Message);
        } finally {
            this.loading = false;
        }
    }

    async getProductStock(): Promise<void> {
        try {
            this.stockProducts = await this.salesInvoiceService
                .getProductsStock(this.userInfo.SalesDivision.SalesDivisionPosID).toPromise();

            for (const product of this.products) {
                if (!product.hasOwnProperty('DeviceAvailableQty')) {
                    product.DeviceAvailableQty = 0;
                }
                const stockProduct = this.stockProducts.find((stockProduct: any) => stockProduct.ProductID === product.ProductID);
                product.DeviceAvailableQty = stockProduct?.DeviceAvailableQty ?? product.DeviceAvailableQty;
            }
        } catch (error) {
            console.error('Error fetching product stock:', error);
        }
    }

    private initializeProductLoading(): void {
        this.loading = true;
        this.searchProduct = '';
        this.newProducts = [];
    }

    private handleProductResult(result: any, categoryID: number): void {
        if (result && result.length > 0) {
            const { products, selectedCategory } = this.salesInvoiceService.productService.handleProductResult(result, categoryID);
            this.products = products;
            this.selectedCategory = selectedCategory;
        } else {
            this.salesInvoiceService.alertPopupService.showWarningDialog("products");
        }
    }

    searchProducts(searchTerm: string): void {
        this.loading = true;
        this.message = '';

        const descriptionKey = this.salesInvoiceService.translationService.getLanguageSettings("Description").text;
        this.newProducts = this.salesInvoiceService.productService.filterProducts(searchTerm, descriptionKey, this.products);

        if (this.newProducts.length === 0) {
            this.message = this.salesInvoiceService.translationService.getLanguageSettings("noProducts").text;
        }

        this.loading = false;
    }

    async getRetailInvoices(): Promise<void> {
        const posId = this.userInfo?.RetailUserPOS?.SalesDivisionPOSID;
        try {
            const result = await this.salesInvoiceService.getRetailInvoices(posId).toPromise();
            this.handleInvoiceResult(result);
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }

    private handleInvoiceResult(result: any): void {
        if (!result) {
            this.salesInvoiceService.alertPopupService.showWarningDialog("retailInvoices");
            return;
        }
        this.retailInvoices = this.salesInvoiceService.recallService.processInvoices(result, this.filterRecallSearch, this.datepicker);
    }

    toggleRecallFilter(filter: { checked: boolean; value: string; }): void {
        filter.checked = !filter.checked;

        this.filterRecallSearch = filter.checked
            ? [...this.filterRecallSearch, filter.value]
            : this.filterRecallSearch.filter(item => item !== filter.value);

        this.getRetailInvoices();
    }

    changeRecallFilterDate(date: Date): void {
        this.datepicker = this.salesInvoiceService.recallService.changeRecallFilterDate(date);
        this.getRetailInvoices();
    }

    searchRecall(value: string): void {
        if (value) {
            this.retailInvoices = this.salesInvoiceService.recallService.searchRecall(value, this.retailInvoices);
        } else {
            this.getRetailInvoices();
        }
    }

    invoiceDetails(invoice: any): void {
        const { selectedInvoice, selectedInvoiceProducts, selectedPayments, addToCart, paidAmount, totalAmount, serviceCharge } = this.salesInvoiceService.recallService.invoiceDetails(invoice);
        Object.assign(this, { selectedInvoice, selectedInvoiceProducts, selectedPayments, addToCart, activeInvoiceTab: 'invoice', paidAmount, totalAmount, serviceCharge });
    }

    updateProductQuantity(product: any, increment: boolean): void {
        this.loading = true;
        this.addToCart = this.salesInvoiceService.productService.updateProductQuantity(product, increment, this.addToCart);
        this.newInvoice(this.addToCart);
        this.loading = false;
    }

    adjustInputWidth(event: KeyboardEvent, product: any): void {
        this.loading = true;
        this.salesInvoiceService.productService.adjustInputWidth(event, product, this.addToCart);
        this.newInvoice(this.addToCart);
        this.loading = false;
    }

    async getPromotions(): Promise<void> {
        try {
            const result = await this.salesInvoiceService.getPromotions().toPromise();
            if (!result) {
                this.salesInvoiceService.alertPopupService.showWarningDialog("promotions.");
                return;
            }

            this.promosList = result;
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }

    async getReceiptMethods(): Promise<void> {
        try {
            const result = await this.salesInvoiceService.getReceiptMethods().toPromise();
            if (!result) {
                this.salesInvoiceService.alertPopupService.showWarningDialog("receiptMethods.");
                return;
            }
            this.receiptMethods = result;
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }

    collectMethodDetails(methodType: string, description: string, methods: any): void {
        const isInvoicePrinted = this.selectedInvoice.SalesInvoiceStatusID === 'Printed';
        const isSupportedMethod = methodType === 'Cash' || methodType === 'Card' || methodType === 'Coupon';

        if (isInvoicePrinted) {
            this.salesInvoiceService.alertPopupService.showWarningDialog("alreadyPaid");
            return;
        }

        if (!isSupportedMethod) {
            this.salesInvoiceService.alertPopupService.showWarningDialog("unsupportedMethod");
            return;
        }

        this[`_get${methodType}`](description, methodType, methods);
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
                methodID: methods.ID,
                amount: this.selectedInvoice.NetTotalAfterTax - this.totalAmount,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.amount) {
                const { amount, methodID } = result;
                this.addPayment(amount, '', ReceiptMethodTypeID, methods, methodID);
                this.totalAmount = this.salesInvoiceService.promoAndMethodService.updateTotalAmount(this.selectedPayments);
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
                methodID: methods.ID,
                amount: this.selectedInvoice.NetTotalAfterTax - this.totalAmount,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { finalAmount, cardNumber, methodID } = result;
                if (finalAmount) {
                    this.addPayment(finalAmount, cardNumber, ReceiptMethodTypeID, methods, methodID);
                    this.totalAmount = this.salesInvoiceService.promoAndMethodService.updateTotalAmount(this.selectedPayments);
                }
            }
        });
    }

    _getCoupon(methodsType: string, ReceiptMethodTypeID: string, methods: any): void {

        const dialogRef = this.dialog.open(CouponComponent, {
            disableClose: true,
            width: "300px",
            direction: this.currentLanguage === 1 ? "ltr" : "rtl",
            data: {
                dataType: "Coupon",
                isMultiCheck: true,
                title: methodsType,
                image: methods.Image,
                methodID: methods.ID,
                amount: this.selectedInvoice.NetTotalAfterTax - this.totalAmount,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const { finalAmount, cardNumber, methodID } = result;
                if (finalAmount) {
                    this.addPayment(finalAmount, cardNumber, ReceiptMethodTypeID, methods, methodID);
                    this.totalAmount = this.salesInvoiceService.promoAndMethodService.updateTotalAmount(this.selectedPayments);
                }
            }
        });
    }

    getTitle(receiptMethodTypeID: string): string {
        switch (receiptMethodTypeID) {
            case 'Card':
                return 'Card';
            case 'Cash':
                return 'Cash';
            case 'Coupon':
                return 'Coupon';
            default:
                return 'Value';
        }
    }

    addPayment(amount: number, cardNumber: string, receiptMethodTypeID: string, methodDetails: any, methodID: number): void {
        this.updateTotalAndPaidAmount();
        this.selectedPaymentsData = this.salesInvoiceService
            .promoAndMethodService
            .addPayment(amount, cardNumber, receiptMethodTypeID, methodDetails, this.selectedPayments, methodID);
    }

    private updateTotalAndPaidAmount(): void {
        const { totalAmount, paidAmount } = this.salesInvoiceService
            .promoAndMethodService
            .updateTotalAndPaidAmount(this.selectedPayments, this.selectedInvoice);
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
    }

    deletePayment(payment: any): void {
        this.selectedPayments = this.salesInvoiceService.promoAndMethodService.deletePayment(payment, this.selectedPayments);
        this.totalAmount = this.salesInvoiceService.promoAndMethodService.updateTotalAmount(this.selectedPayments);
    }

    deleteProductFromCart(product: any): void {
        this.addToCart = this.salesInvoiceService.productService.deleteProductFromCart(product, this.addToCart);
        this.refreshInvoice();
    }

    private refreshInvoice(): void {
        this.newInvoice(this.addToCart);
    }

    newInvoice(cart: any): void {
        const invoiceData = this.salesInvoiceService.recallService.constructInvoiceData(
            cart,
            this.selectedInvoice,
            this.selectedPayments,
            this.userInfo,
            this.serviceCharge
        );
        this.createRetailInvoice(invoiceData);
    }

    private async createRetailInvoice(invoiceData: any): Promise<void> {
        try {
            const result = await this.salesInvoiceService.retailInvoice_Create(invoiceData).toPromise();
            this.processInvoiceCreationResult(result);
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        }
    }

    private processInvoiceCreationResult(result: any): void {
        if (result) {
            this.selectedInvoice = result;
            this.selectedInvoiceProducts = result.Products;
            this.userInfo.DefaultCustomer.CustomerDescription = result.CustDescription;
        } else {
            this.salesInvoiceService.alertPopupService.showWarningDialog("creatingInvoice");
        }
    }

    async addItemOrGroup(product: any): Promise<void> {
        this.loading = true;
        try {
            // const stock = await this.salesInvoiceService.getProductsStock(this.userInfo.SalesDivision.SalesDivisionPosID, product.ProductID).toPromise();
            this.salesInvoiceService.productService.addItemOrGroup(product, this.selectedInvoice, this.addToCart, this.userInfo);
            this.newInvoice(this.addToCart);
            this.goTab('invoice');
        } catch (error: any) {
            this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
        } finally {
            this.loading = false;
        }
    }

    postCash() {
        if (this.totalAmount >= this.selectedInvoice.NetTotalAfterTax) {
            this.newInvoice(this.addToCart);
            this.resetInvoiceState();
        } else {
            this.salesInvoiceService.alertPopupService.showWarningDialog("paidLessAmount");
        }
    }

    addNewInvoice(): void {
        if (!this.selectedInvoice) return;
        this.resetInvoiceState();
    }

    async RetailInvoice_Void() {
        if (this.selectedInvoice && this.selectedInvoice.SalesInvoiceStatusID === 'Created') {
            try {
                const result = await firstValueFrom(this.salesInvoiceService.RetailInvoice_Void(this.selectedInvoice.ID));
                this.getRetailInvoices();
                this.resetInvoiceState();
            } catch (error: any) {
                this.salesInvoiceService.alertPopupService.showErrorDialog(error.error.Message);
            }
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

    toggleFullscreen(): void {
        this.isFullscreen = this.salesInvoiceService.initService.toggleFullscreen(this.isFullscreen);
    }
}
