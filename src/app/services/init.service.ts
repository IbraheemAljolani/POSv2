import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    elem: any;

    constructor(
        @Inject(DOCUMENT) private document: any,
    ) { }

    loadPackageVersion() {
        const packageJson = require('../../../package.json');
        return packageJson.version;
    }

    loadCategories(): any[] {
        const categories = sessionStorage.getItem('categories');
        return categories ? JSON.parse(categories) : null;
    }

    getColor(statusId: string): string {
        const statusColors: Record<string, string> = {
            Created: '#6eb66e',
            Printed: '#f1da91',
            'Under Delivery': '#96c7e7',
            Void: '#f25022',
        };

        return statusColors[statusId] || '';
    }

    updateDocumentDirection(currentLanguage: number): void {
        const direction = currentLanguage === 1 ? 'ltr' : 'rtl';
        this.document.body.classList.remove(`trio-${direction === 'ltr' ? 'rtl' : 'ltr'}`);
        this.document.body.classList.add(`trio-${direction}`);
        this.document.body.dir = direction;
    }

    toggleFullscreen(isFullscreen: boolean) {
        isFullscreen ? this.closeFullscreen() : this.openFullscreen();
        isFullscreen = !isFullscreen;
        return isFullscreen;
    }

    private openFullscreen() {
        const requestMethods = [
            "requestFullscreen",
            "mozRequestFullScreen",
            "webkitRequestFullscreen",
            "msRequestFullscreen"
        ];
        requestMethods.forEach(method => {
            if (this.elem[method]) this.elem[method]();
        });
    }

    private closeFullscreen() {
        const exitMethods = [
            "exitFullscreen",
            "mozCancelFullScreen",
            "webkitExitFullscreen",
            "msExitFullscreen"
        ];
        exitMethods.forEach(method => {
            if ((document as any)[method]) (document as any)[method]();
        });
    }
}
