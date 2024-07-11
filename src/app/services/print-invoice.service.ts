import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintInvoiceService {

  constructor() { }

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
}
