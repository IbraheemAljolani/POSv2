import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
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

  constructor(public dialog: MatDialog, private salesInvoiceService: SalesInvoiceService, @Inject(DOCUMENT) private document: any) { }

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

  ngOnInit(): void {
    this.getUserInfo();

    this.elem = document.documentElement;

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
      this.getRetailInvoices();
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

    if (!this.selectedInvoice) {
      Swal.fire({
        icon: "warning",
        title: "Warning...",
        text: "Please create a new invoice or select an existing invoice.",
      });
      return;
    }

    const dialogRef = this.dialog.open(CustomerSelectComponent, {
      disableClose: true,
      data: { title: "Set Customer", DefaultCustomer: this.userInfo.DefaultCustomer },
      direction: "ltr",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      sessionStorage.setItem('selectCustomer', JSON.stringify(result.selectedCustomer));
      this.userInfo.DefaultCustomer.CustID = result.selectedCustomer[0];
      this.userInfo.DefaultCustomer.CustomerDescription = result.selectedCustomer[1];
    });
  }

  openMenuDrilldown(productItem: any): void {
    const dialogRef = this.dialog.open(SimpleLOVComponent, {
      disableClose: true,
      maxHeight: '98%',
      width: "80%",
      minWidth: '300px',
      direction: "ltr",
      data: { dataType: "drillDown", isMultiCheck: false, productItem: productItem, title: productItem.DescriptionEn + ' Qty', SalesDivisionPOSID: this.userInfo?.RetailUserPOS?.SalesDivisionPOSID },
    });

    dialogRef.afterClosed().subscribe((selectedResult) => {

    });
  }

  selectSalesMan(): void {
    const dialogRef = this.dialog.open(SimpleLOVComponent, {
      disableClose: true,
      maxHeight: '98%',
      width: "70%",
      minWidth: '300px',
      direction: "ltr",
      data: { dataType: "salesMen", isMultiCheck: false, title: "SalesMen" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.salesManID = result[0];
      this.salesManName = result[1];
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
    { label: 'Void', value: 'rejected', color: '#f25022', checked: false },
  ];

  toggleFilter(filter: { checked: boolean; value: any; }): void {
    filter.checked = !filter.checked;
    if (filter.checked) {
      this.filterRecallSearch.push(filter.value);
    } else {
      this.filterRecallSearch = this.filterRecallSearch.filter(item => item !== filter.value);
    }
    this.getRetailInvoices();
  }

  changeDate(date: any) {
    date.setDate(date.getDate() + 1);
    this.datepicker = date.toISOString().slice(0, 10);
    this.getRetailInvoices();
  }

  searchRecall(value: string) {
    if (value) {
      this.retailInvoices = this.retailInvoices.filter((item: { Code: string; ID: number; CustDescription: string }) => item.Code.includes(value) || item.ID.toString().includes(value) || item.CustDescription.includes(value));
    } else {
      this.getRetailInvoices();
    }
  }

  getRetailInvoices() {
    this.salesInvoiceService.getRetailInvoices(this.userInfo?.RetailUserPOS?.SalesDivisionPOSID).subscribe((result: any) => {
      if (result) {

        if (this.filterRecallSearch.includes('date')) {
          this.retailInvoices = this.filterByDate(result);
        } else {
          this.retailInvoices = this.filterByStatus(result);
        }

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

  filterByDate(result: any[]) {
    const filterFunc = (item: { CreatedDate: string; SalesInvoiceStatusID?: string }) => {
      const isDateMatch = item.CreatedDate.slice(0, 10) === this.datepicker;
      const isStatusMatch = this.filterRecallSearch.length > 1 ? (item.SalesInvoiceStatusID && this.filterRecallSearch.includes(item.SalesInvoiceStatusID.toLowerCase())) : true;
      return isDateMatch && isStatusMatch;
    };
    return result.filter(filterFunc);
  }

  filterByStatus(result: any[]) {
    if (this.filterRecallSearch.length === 1) {
      return result.filter((item: { SalesInvoiceStatusID: string }) =>
        this.filterRecallSearch.includes(item.SalesInvoiceStatusID.toLowerCase())
      );
    }
    return result;
  }

  invoiceDetails(invoice: any) {
    this.addToCart = [];
    this.selectedInvoice = invoice;
    this.selectedInvoiceProducts = this.selectedInvoice.Products;
    this.addToCart.push(...this.selectedInvoiceProducts);
    this.activeInvoiceTab = 'invoice';
    this.paidAmount = this.selectedInvoice.NetTotalAfterTax;

    if (invoice.SalesInvoiceStatusID === "Printed") {
      if (!this.selectedPayments) {
        this.selectedPayments = [];
      }

      this.totalAmount = this.selectedInvoice.Payments[0].CashReceiptAmount;

      this.paidAmount = this.selectedInvoice.Payments[0].CashReturnedAmount;

      this.serviceCharge = this.selectedInvoice.ServiceCharge;

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
    this.addToCart.forEach((item: any) => {
      if (item.ProductID === product.ProductID) {
        item.Qty = product.Qty;
      }
    });
    this.newInvoice(this.addToCart);

  }

  decreaseQty(product: any) {
    if (product.Qty > 1) {
      product.Qty--;
      this.addToCart.forEach((item: any) => {
        if (item.ProductID === product.ProductID) {
          item.Qty = product.Qty;
        }
      });
      this.newInvoice(this.addToCart);
    }
  }

  adjustInputWidth(event: KeyboardEvent, product: any) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.style.width = ((inputElement.value.length + 10) * 8) + 'px';
    this.addToCart.forEach((item: any) => {
      if (item.ProductID === product.ProductID) {
        item.Qty = inputElement.value;
      }
    });
    this.newInvoice(this.addToCart);
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
      width: "300px",
      direction: "ltr",
      data: {
        dataType: "Cash",
        isMultiCheck: true,
        title: methodsType,
        image: methods.Image,
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
        image: methods.Image,
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

    if (this.selectedPayments.some((item: { ReceiptMethodTypeID: string; }) => item.ReceiptMethodTypeID === ReceiptMethodTypeID)) {
      this.selectedPayments.forEach((item: { ReceiptMethodTypeID: string; Amount: number; }) => {
        if (item.ReceiptMethodTypeID === ReceiptMethodTypeID) {
          item.Amount = amount;
        }
      });
    } else {
      this.selectedPayments.unshift({
        ReceiptMethodID: methods.ID,
        ReceiptMethodTypeID: ReceiptMethodTypeID,
        Description: "",
        Amount: amount,
        SoldAmount: 0,
        invoiceDate: new Date()
      });
    }

    this.totalAmount = this.selectedPayments.reduce((sum: any, item: { Amount: any; }) => sum + item.Amount, 0.000);

    this.paidAmount = this.selectedInvoice.NetTotalAfterTax - this.totalAmount;

    this.selectedPaymentsData.push(methods)
  }

  deleteCash(item: any) {
    this.selectedPayments.splice(this.selectedPayments.indexOf(item), 1);
    this.totalAmount = this.selectedPayments.reduce((sum: any, item: { Amount: any; }) => item.Amount - sum, 0);
  }

  deleteItem(item: any) {
    for (let i = 0; i < this.addToCart.length; i++) {
      if (this.addToCart[i].ProductID === item.ProductID) {
        this.addToCart.splice(i, 1);
        break;
      }
    }

    this.newInvoice(this.addToCart);
  }

  newInvoice(cart: any) {
    const currentDate = new Date();

    const POSCode = `${this.userInfo.SalesDivision.SalesDivisionID}/${this.userInfo.SalesDivision.SalesDivisionPosID}/${currentDate.getFullYear().toString().slice(-2)}/${currentDate.getMonth() + 1}-${Math.floor(Math.random() * 100)}`;

    let table = sessionStorage.getItem('selectedTable');
    if (table) {
      var tableID = JSON.parse(table).ID;
    } else {
      var tableID = null;
    }

    var customer = sessionStorage.getItem('selectCustomer');
    customer = customer ? JSON.parse(customer) : null;

    this.data = {
      Code: this.selectedInvoice?.Code ? this.selectedInvoice.Code : null,
      POSCode: this.selectedInvoice?.POSCode ? this.selectedInvoice.POSCode : POSCode,
      SalesInvoiceStatusID: this.selectedInvoice?.SalesInvoiceStatusID ? this.selectedInvoice.SalesInvoiceStatusID : 'Created',
      CustID: this.userInfo.DefaultCustomer.CustID,
      Description: customer ? customer[1] : null,
      CustDescription: customer ? customer[1] : null,
      ManualDiscountAmount: this.selectedInvoice?.ManualDiscountAmount ? this.selectedInvoice.ManualDiscountAmount : 0.0,
      DiscountPercentage: this.selectedInvoice?.DiscountPercentage ? this.selectedInvoice.DiscountPercentage : 0.0,
      TipAmount: this.selectedInvoice?.TipAmount ? this.selectedInvoice.TipAmount : 0.0,
      TableID: tableID,
      ServiceCharge: this.serviceCharge ? 1 : 0,
      SalesDivisionPOSID: this.userInfo.RetailUserPOS.SalesDivisionPOSID ? this.userInfo.RetailUserPOS.SalesDivisionPOSID : 0,
      RetailOrderReferenceCode: this.selectedInvoice?.RetailOrderReferenceCode ? this.selectedInvoice.RetailOrderReferenceCode : null,
      RetailOrderID: this.selectedInvoice?.RetailOrderID ? this.selectedInvoice.RetailOrderID : null,
      SalesInvoiceDate: this.selectedInvoice?.SalesInvoiceDate ? this.selectedInvoice.SalesInvoiceDate : new Date(),
      Products: cart,
      Payments: this.selectedPayments,
      Notes: this.selectedInvoice?.Notes ? this.selectedInvoice.Notes : null,
      ReferenceCode: this.selectedInvoice?.ReferenceCode ? this.selectedInvoice.ReferenceCode : uuid(),
      CashBookID: this.selectedInvoice?.CashBookID ? this.selectedInvoice.CashBookID : null,
      CreatedDate: this.selectedInvoice?.CreatedDate ? this.selectedInvoice.CreatedDate : new Date(),
      Amounts: this.selectedInvoice?.NetTotalAfterTax ?? 0,
    }

    this.salesInvoiceService.retailInvoice_Create(this.data).subscribe((result: any) => {
      if (result) {
        this.selectedInvoice = result;
        this.selectedInvoiceProducts = result.Products;
        this.userInfo.DefaultCustomer.CustomerDescription = result.CustDescription;
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

    if (['Printed', 'Rejected'].includes(this.selectedInvoice?.SalesInvoiceStatusID)) return;


    let item = this.addToCart.find((item: { ProductID: any; }) => item.ProductID === product.ProductID);

    this.salesInvoiceService.getProductsStock(this.userInfo.SalesDivision.SalesDivisionPosID, product.ProductID).subscribe((result: any) => {
      if (result[0] && result[0].DeviceAvailableQty > 0) {
        if (item) {
          item.Qty++;
        } else {
          this.addToCart.push({
            "ProductID": product.ProductID,
            "TaxGroupID": product.TaxGroupID,
            "UOMID": product.UOMID,
            "Description": this.getDescription(product, 'DescriptionEn', 'DescriptionAr'),
            "UOMDescription": this.getDescription(product, 'UOMDescriptionEn', 'UOMDescriptionAr'),
            "ReturnedQty": 0,
            "ReturnQty": 0,
            "Qty": 1,
            "RemainingQty": 1,
            "SalesPrice": product.SalesPrice,
            "Amount": product.SalesPrice * 1,
            "NetTotalBeforeDiscount": product.SalesPrice * 1,
            "TotalDiscount": 0,
            "DiscountPercentage": 0,
            "DiscountPerUnit": 0,
            "NetTotalAfterDiscount": product.SalesPrice * 1,
            "TaxAmount": 0,
            "TaxPercent": 0,
            "NetTotalAfterTax": product.SalesPrice * 1,
            "Additions": [],
            "Seriales": [],
            "Batches": [],
            "CurrencyID": this.userInfo?.CompanyInfo.CurrencyID,
            "AppReferenceTransCode": uuid(),
            "RetailOrderReferenceTransCode": "",
            "Note": product.Note,
          });
        }
        this.newInvoice(this.addToCart);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning...",
          text: "No stock available.",
        });
      }
    })
  }

  postCash() {
    if (this.totalAmount >= this.selectedInvoice.NetTotalAfterTax) {
      this.newInvoice(this.addToCart);
      this.selectedInvoice = null;
      this.selectedInvoiceProducts = [];
      this.addToCart = [];
      this.selectedPayments = [];
      this.totalAmount = 0;
      this.paidAmount = 0.000;
      this.activeInvoiceTab = 'invoice';
      sessionStorage.removeItem('selectCustomer');
      sessionStorage.removeItem('selectedTable');
      this.salesManID = 0;
      this.salesManName = '';
      this.selectedTable = '---';
      this.userInfo.DefaultCustomer.CustID = this.userInfo.DefaultCustomer.CustID;
      this.userInfo.DefaultCustomer.CustomerDescription = this.userInfo.DefaultCustomer.CustomerDescription;
    } else {
      Swal.fire({
        icon: "warning",
        title: "Warning...",
        text: "Paid amount is less than the total amount.",
      });
    }
  }

  addNewInvoice() {
    if (this.selectedInvoice) {
      this.selectedInvoice = null;
      this.selectedInvoiceProducts = [];
      this.addToCart = [];
      this.selectedPayments = [];
      this.totalAmount = 0;
      this.paidAmount = 0.000;
      this.activeInvoiceTab = 'invoice';
    }
  }

  RetailInvoice_Void() {
    if (this.selectedInvoice && this.selectedInvoice.SalesInvoiceStatusID === 'Created') {

      Swal.fire({
        title: "Do you want to void the invoice?",
        showCancelButton: true,
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          this.salesInvoiceService.RetailInvoice_Void(this.selectedInvoice.ID).subscribe((result: any) => {
            if (result) {
              this.selectedInvoice.SalesInvoiceStatusID = 'Void';
              Swal.fire({
                icon: "success",
                title: "Success...",
                text: "Invoice has been voided successfully.",
              });
            } else {
              Swal.fire({
                icon: "question",
                title: "Warning...",
                text: "Error in voiding invoice.",
              });
            }
          });
        }
      });
    }
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.closeFullscreen();
    } else {
      this.openFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

  printPage() {
    let printContents, popupWin;
    const agreementSection = document.getElementById('agrrement-section');
    printContents = agreementSection ? agreementSection.innerHTML : '';
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    if (popupWin) {
      popupWin.document.open();
      popupWin.document.write(`
				<html>
					<head>
						<title>Trio365</title>
						<style type="text/css">
              p {
                font-family: "Times New Roman";
              }

              .padding-main-divcls{
                padding: 5px;
              }

              .text-center{
                text-align: center
              }
              .width-full{
                width: 100%;
              }

              .box{
                  border-style: solid;
                  border-width: 1px;
                  width: 65px;
                  height: 100px;
                  float: right;
                  margin-right: 50px;
                  font-size: 10px;
                  padding: 5px;
              }
              .box-divcls{
                width: 100%;
                display: inline-block;
              }

              .TermsConditionTable, tr , td {
								padding: 4px !important;
							}
							tr, td {
								page-break-inside: avoid !important;
							}
            

							.break-after{
								page-break-after: always;
							}
              .top-border-cls{
                border-top: solid black 1.0pt;
              }
            </style>
            <body onload="window.print();window.close()">${printContents}</body>
          </head>
        </html>
      `)
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
