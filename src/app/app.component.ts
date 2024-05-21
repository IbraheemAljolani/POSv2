import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardComponent } from 'src/app/Payment/card/card.component';
import { CashComponent } from 'src/app/Payment/cash/cash.component';
import { CustomerSelectComponent } from 'src/app/popup/customer-select/customer-select.component';
import { SimpleLOVComponent } from 'src/app/popup/simple-lov/simple-lov.component';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';
import Swal from 'sweetalert2';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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
  promoSelectAllFlag: boolean = false;
  openPromotion: boolean = false;
  promosList: any = [];
  receiptMethods: any = [];
  Amounts: any;
  selectedPayments: any = [];
  addToCart: any = [];
  data: any;
  serviceCharge: boolean = false;
  selectedPaymentsData: any = [];

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
      }, (error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.error.Message,
        });
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
    this.salesInvoiceService.getRetailInvoices().subscribe((result: any) => {
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
    this.addToCart = [];
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

  openDetails(product: { opened: boolean; }) {
    product.opened = !product.opened;
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

  collectMethodDetails(methodsType: string, discreption: string, methods: any) {
    if (this.selectedInvoice.SalesInvoiceStatusID === 'Printed') {
      Swal.fire({
        icon: "warning",
        title: "Warning...",
        text: "You can't add another payment method for this invoice.",
      });
      return;
    }
    if (methodsType === 'Cash') {
      this._getCash(discreption, methodsType, methods);
    } else if (methodsType === 'Card') {
      this._getCard(discreption, methodsType, methods);
    }
  }

  _getCash(methodsType: string, ReceiptMethodTypeID: string, methods: any): void {
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
        this.addPayment(result, ReceiptMethodTypeID, methods)
      }
    });
  }

  _getCard(methodsType: string, ReceiptMethodTypeID: string, methods: any): void {

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
        this.addPayment(result, ReceiptMethodTypeID, methods)
      }
    });
  }

  addPayment(amount: number, ReceiptMethodTypeID: string, methods: any) {

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

    this.selectedPaymentsData.push(methods)
  }

  deleteCash(item: any) {
    if (this.doesInvoiceStatusDisallow()) return;

    this.selectedPayments.splice(this.selectedPayments.indexOf(item), 1);
  }

  doesInvoiceStatusDisallow(): boolean {
    return (this.retailInvoices.SalesInvoiceStatusID !== "Created");
  }

  newInvoice() {
    const currentDate = new Date();

    const POSCode = `${this.userInfo.SalesDivision.SalesDivisionID}/${this.userInfo.SalesDivision.SalesDivisionPosID}/${currentDate.getFullYear().toString().slice(-2)}/${currentDate.getMonth() + 1}-${Math.floor(Math.random() * 100)}`;

    let table = sessionStorage.getItem('selectedTable');
    if (table) {
      var tableID = JSON.parse(table).ID;
    } else {
      var tableID = null;
    }

    this.data = {
      Code: this.selectedInvoice?.Code ? this.selectedInvoice.Code : null,
      POSCode: this.selectedInvoice?.POSCode ? this.selectedInvoice.POSCode : POSCode,
      SalesInvoiceStatusID: this.selectedInvoice?.SalesInvoiceStatusID ? this.selectedInvoice.SalesInvoiceStatusID : 'Created',
      CustID: this.userInfo.DefaultCustomer.CustID,
      Description: this.userInfo.DefaultCustomer.CustomerDescription,
      CustDescription: this.userInfo.DefaultCustomer.CustomerDescription,
      ManualDiscountAmount: this.selectedInvoice?.ManualDiscountAmount ? this.selectedInvoice.ManualDiscountAmount : 0.0,
      DiscountPercentage: this.selectedInvoice?.DiscountPercentage ? this.selectedInvoice.DiscountPercentage : 0.0,
      TipAmount: this.selectedInvoice?.TipAmount ? this.selectedInvoice.TipAmount : 0.0,
      TableID: tableID,
      ServiceCharge: this.serviceCharge ? 1 : 0,
      SalesDivisionPOSID: this.userInfo.RetailUserPOS.SalesDivisionPOSID ? this.userInfo.RetailUserPOS.SalesDivisionPOSID : 0,
      RetailOrderReferenceCode: this.selectedInvoice?.RetailOrderReferenceCode ? this.selectedInvoice.RetailOrderReferenceCode : null,
      RetailOrderID: this.selectedInvoice?.RetailOrderID ? this.selectedInvoice.RetailOrderID : null,
      SalesInvoiceDate: this.selectedInvoice?.SalesInvoiceDate ? this.selectedInvoice.SalesInvoiceDate : new Date(),
      Products: this.selectedInvoice?.Products ? this.selectedInvoice.Products : this.addToCart,
      Payments: this.selectedPaymentsData,
      Notes: this.selectedInvoice?.Notes ? this.selectedInvoice.Notes : null,
      ReferenceCode: uuid(),
      CashBookID: this.selectedInvoice?.CashBookID ? this.selectedInvoice.CashBookID : null,
      CreatedDate: this.selectedInvoice?.CreatedDate ? this.selectedInvoice.CreatedDate : new Date(),
    }
    console.log(this.selectedPayments);
    this.salesInvoiceService.retailInvoice_Create(this.data).subscribe((result: any) => {
      if (result) {
        this.selectedInvoice = result;
        this.selectedInvoiceProducts = result.Products;
        this.activeInvoiceTab = 'invoice';
        this.openCustomerDialog();
      } else {
        Swal.fire({
          icon: "question",
          title: "Warning...",
          text: "Error in creating invoice.",
        });
      }
    }, (error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.error.Message,
      })
    });
  }

  addItemOrGroup(product: any) {

    if (this.selectedInvoice) {

      if (this.selectedInvoice.Products.find((item: { ProductID: any; }) => item.ProductID === product.ProductID)) {
        Swal.fire({
          icon: "warning",
          title: "Warning...",
          text: "Product already exists in the invoice.",
        });
      } else {
        this.selectedInvoice.Products.push({
          "ProductID": product.ProductID,
          "RetailInvoiceID": this.selectedInvoice.ID,
          "TaxGroupID": product.TaxGroupID,
          "UOMID": product.UOMID,
          "Description": this.getDescription(product, 'DescriptionEn', 'DescriptionAr'),
          "UOMDescription": this.getDescription(product, 'UOMDescriptionEn', 'UOMDescriptionAr'),
          "ReturnedQty": 0,
          "ReturnQty": 0,
          "Qty": product.Qty,
          "RemainingQty": 0,
          "SalesPrice": product.SalesPrice,
          "Amount": product.SalesPrice * product.Qty,
          "NetTotalBeforeDiscount": product.SalesPrice * product.Qty,
          "TotalDiscount": 0,
          "DiscountPercentage": 0,
          "DiscountPerUnit": 0,
          "NetTotalAfterDiscount": product.SalesPrice * product.Qty,
          "TaxAmount": 0,
          "TaxPercent": 0,
          "NetTotalAfterTax": product.SalesPrice * product.Qty,
          "Additions": [],
          "Seriales": [],
          "Batches": [],
          "CurrencyID": this.userInfo?.CompanyInfo.CurrencyID,
          "AppReferenceTransCode": uuid(),
          "RetailOrderReferenceTransCode": "",
          "Note": product.Note,
        });
      }
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
