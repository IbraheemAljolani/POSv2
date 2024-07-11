import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '../dialog/dynamic-dialog/dynamic-dialog.component';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(
    private dialog: MatDialog,
    private translationService: TranslationService,
  ) { }

  openDialog(data: any): void {
    const dialogConfig = {
      width: '250px',
      data: data,
    };

    this.dialog.open(DynamicDialogComponent, dialogConfig);
  }

  getDialogDirection(currentLanguage: number): 'ltr' | 'rtl' {
    return currentLanguage === 1 ? 'ltr' : 'rtl';
  }

  getDialogData(SalesDivisionPOSID: number): any {
    return {
      dataType: 'POS',
      isMultiCheck: false,
      title: 'POS',
      idName: 'POSID',
      selectedPOSID: SalesDivisionPOSID,
    };
  }

  updateDefaultCustomer(selectedCustomer: any) {
    sessionStorage.setItem('selectedCustomer', JSON.stringify(selectedCustomer));
    const [custID, customerDescription] = selectedCustomer;
    let CustID = custID;
    let CustomerDescription = customerDescription;

    return { CustID, CustomerDescription };
  }

  getDialogConfig(dialogType: string, userInfo: any, productItem: any) {
    const baseConfig = {
      disableClose: true,
      direction: this.getDialogDirection(this.translationService.languageId),
      minWidth: '300px',
    };

    switch (dialogType) {
      case 'POS':
        return {
          ...baseConfig,
          maxHeight: '98%',
          width: '60%',
          data: this.getDialogData(userInfo.RetailUserPOS.SalesDivisionPOSID),
        };
      case 'customer':
        return {
          ...baseConfig,
          data: {
            title: "Select Customer",
            defaultCustomer: userInfo.DefaultCustomer
          },
        };
      case 'productsStock':
        return {
          ...baseConfig,
          maxHeight: '98%',
          width: "80%",
          data: { dataType: "drillDown", isMultiCheck: false, productItem: productItem, title: `${productItem.DescriptionEn} Qty`, SalesDivisionPOSID: userInfo?.RetailUserPOS?.SalesDivisionPOSID },
        };
      case 'salesMan':
        return {
          ...baseConfig,
          maxHeight: '98%',
          width: "70%",
          data: { dataType: "salesMen", isMultiCheck: false, title: "Sales Man" },
        };
      default:
        return baseConfig;
    }
  }
}
