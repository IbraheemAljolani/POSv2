import { Injectable } from '@angular/core';
import { IUserInfo } from '../Interface/iuser-info';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor() { }

  recordDetails: IUserInfo = (window as any).recordDetails;
  languageId = this.recordDetails.languageId

  getTranslation(key: string): string {
    const translations: { [key: number]: { [key: string]: string } } = {
      1: {
        'uploadFileText': 'Drag & drop any file here or click to browse',
      },
      2: {
        'uploadFileText': 'اسحب وأسقط أي ملف هنا أو انقر للتصفح',
      }
    };

    return translations[this.languageId] && translations[this.languageId][key]
      ? translations[this.languageId][key]
      : 'Translation not found';
  }
}
