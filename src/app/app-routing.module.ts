import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerSelectComponent } from './popup/customer-select/customer-select.component';
import { SalesInvoiceComponent } from './POS/sales-invoice/sales-invoice.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
