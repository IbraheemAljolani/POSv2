import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class AlertPopupService {

  constructor(
    private translationService: TranslationService,
  ) { }

  showDialog(icon: SweetAlertIcon, title: string, errorMessage: string): void {
    const languageSettings = this.getLanguageSettings(errorMessage);
    this.showAlert(icon, languageSettings);
  }

  showWarningDialog(errorMessage: string): void {
    const languageSettings = this.getLanguageSettings(errorMessage);
    this.showAlert("question", languageSettings);
  }

  showErrorDialog(errorMessage: string): void {
    this.showDialog("error", "Oops...", errorMessage);
  }

  getLanguageSettings(errorMessage: string): { confirmButtonText: string; title: string; text: string; } {
    return this.translationService.getLanguageSettings(errorMessage);
  }

  showAlert(icon: SweetAlertIcon, languageSettings: { confirmButtonText: string; title: string; text: string; }): void {
    Swal.fire({
      icon: icon,
      confirmButtonText: languageSettings.confirmButtonText,
      title: languageSettings.title,
      text: languageSettings.text,
    });
  }
}
