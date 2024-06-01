import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { CustomerSelectComponent } from './popup/customer-select/customer-select.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SalesInvoiceComponent } from './POS/sales-invoice/sales-invoice.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SimpleLOVComponent } from './popup/simple-lov/simple-lov.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './Interceptor/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from './directive/click-outside.directive';
import { CashComponent } from './Payment/cash/cash.component';
import { CardComponent } from './Payment/card/card.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
    declarations: [
        AppComponent,
        CustomerSelectComponent,
        SalesInvoiceComponent,
        SimpleLOVComponent,
        ClickOutsideDirective,
        CashComponent,
        CardComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgxMaterialTimepickerModule,
        MatAutocompleteModule,
        MatDialogModule,
        HttpClientModule,
        FormsModule,
        QRCodeModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
