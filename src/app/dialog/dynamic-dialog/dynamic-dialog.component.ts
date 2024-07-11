import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <div mat-dialog-content>
      <ng-container *ngComponentOutlet="dynamicComponent; injector: dynamicInjector"></ng-container>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class DynamicDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}