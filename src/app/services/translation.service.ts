import { Injectable } from '@angular/core';
import { IUserInfo } from '../Interface/iuser-info';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {

    constructor() { }

    userInfo: IUserInfo = (window as any).recordDetails;
    getUserInfoSafe(): IUserInfo | undefined {
        const userInfo = sessionStorage.getItem('userInfo');
        if (!userInfo) {
            sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        }
        return this.userInfo;
    }
    languageId = this.getUserInfoSafe()?.languageId ?? 1;

    getLanguageSettings(errorMessage: string) {
        const messages: { [key: string]: string[] } = {
            branchTables: ["Error in getting branch tables.", "خطأ في الحصول على جداول الفروع."],
            userInfo: ["Error in getting user info.", "خطأ في الحصول على معلومات المستخدم."],
            invoice: ["Please select an invoice.", "الرجاء تحديد فاتورة."],
            categories: ["Error in getting categories.", "خطأ في الحصول على الفئات."],
            products: ["Error in getting products.", "خطأ في الحصول على المنتجات."],
            retailInvoices: ["Error in getting retail invoices.", "خطأ في الحصول على الفواتير التجزئة."],
            promotions: ["Error in getting promotions.", "خطأ في الحصول على العروض."],
            receiptMethods: ["Error in getting receipt methods.", "خطأ في الحصول على طرق الدفع."],
            alreadyPaid: ["Invoice is already paid.", "الفاتورة مدفوعة بالفعل."],
            creatingInvoice: ["Error in creating invoice.", "خطأ في إنشاء الفاتورة."],
            outOfStock: ["Product is out of stock.", "المنتج غير متوفر."],
            paidLessAmount: ["Paid amount is less than total amount.", "المبلغ المدفوع أقل من المبلغ الإجمالي."],
            noProducts: ["No products found.", "لم يتم العثور على منتجات."],
            firstInvoice: ["Select Your First Product to Invoice", "حدد المنتج الأول للفاتورة"],
            totalAmount: ["Total Amount", "المبلغ الإجمالي"],
            thanksVisit: ["Thanks for your visit", "شكرا لزيارتك"],
            Description: ["DescriptionEn", "DescriptionAr"],
        };

        const defaultMsg = ["An unknown error occurred.", "حدث خطأ غير معروف."];
        const [en, ar] = messages[errorMessage] || defaultMsg;
        const textMessage = this.languageId === 1 ? en : ar;

        return {
            confirmButtonText: this.languageId === 1 ? "OK" : "حسنا",
            title: this.languageId === 1 ? "Warning..." : "تحذير...",
            text: textMessage
        };
    }
}
