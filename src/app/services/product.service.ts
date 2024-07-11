import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor() { }

  handleProductResult(result: any[], categoryID: number): { products: any[]; selectedCategory: string | null } {
    const products = result.filter(item => item.CategoryID === categoryID);
    const selectedCategory = sessionStorage.getItem('selectedCategory');
    return { products, selectedCategory };
  }

  filterProducts(searchTerm: string, descriptionKey: string, products: any): any[] {
    return products.filter((product: { [x: string]: string; }) =>
      product[descriptionKey].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  updateProductQuantity(product: any, increment: boolean, addToCart: any[]): any[] {
    if (!increment && product.Qty === 1) {
      return addToCart;
    }

    return addToCart.map(item =>
      item.ProductID === product.ProductID ? { ...item, Qty: product.Qty + (increment ? 1 : -1) } : item
    );
  }

  adjustInputWidth(event: KeyboardEvent, product: any, addToCart: any) {
    const inputElement = event.target as HTMLInputElement;
    inputElement.style.width = `${Math.max(inputElement.value.length + 1, 10) * 8}px`;

    this.updateCartQuantity(product.ProductID, parseInt(inputElement.value, 10), addToCart);
  }

  private updateCartQuantity(productId: number, quantity: string | number, addToCart: any) {
    addToCart.forEach((item: { ProductID: number; Qty: number; }) => {
      if (item.ProductID === productId) {
        item.Qty = parseInt(quantity.toString(), 10) || 0;
      }
    });
  }

  deleteProductFromCart(product: { ProductID: number; }, addToCart: Array<{ ProductID: number; }>) {
    const productIndex = addToCart.findIndex((cartItem) => cartItem.ProductID === product.ProductID);
    if (productIndex !== -1) {
      addToCart.splice(productIndex, 1);
    }
    return addToCart;
  }

  addItemOrGroup(product: any, selectedInvoice: any, addToCart: any, userInfo: any) {
    if (['Printed', 'Rejected'].includes(selectedInvoice?.SalesInvoiceStatusID)) return;
    const itemIndex = addToCart.findIndex((item: { ProductID: any; }) => item.ProductID === product.ProductID);

    if (itemIndex !== -1) {
      addToCart[itemIndex] = { ...addToCart[itemIndex], Qty: addToCart[itemIndex].Qty + 1 };
    } else {
      this.addNewProductToCart(product, userInfo, addToCart);
    }
  }

  private addNewProductToCart(product: any, userInfo: any, addToCart: any) {
    const description = product.DescriptionEn;
    addToCart.push({
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
      CurrencyID: userInfo?.CompanyInfo.CurrencyID,
      AppReferenceTransCode: uuid(),
      RetailOrderReferenceTransCode: "",
      Note: product.Note,
    });

    return addToCart;
  }

}

