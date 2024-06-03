import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SalesInvoiceService } from 'src/app/services/sales-invoice.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  token: string = '';
  constructor(private salesInvoiceService: SalesInvoiceService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.token = this.salesInvoiceService.userInfo.token;
    const authToken = this.token;

    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    return next.handle(modifiedReq).pipe(
      catchError(err => {
        if (err.status === 401) {
          window.location.href = 'https://www.triosuite.com/';
        }
        return throwError(() => err);
      })
    );
  }
}
