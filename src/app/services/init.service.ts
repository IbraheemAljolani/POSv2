import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    elem: any;

    constructor(
        @Inject(DOCUMENT) private document: any,
    ) {
        this.initializeFullScreenElement();
    }

    private initializeFullScreenElement(): void {
        this.elem = document.documentElement;
    }

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

    private openFullscreen(): void {
        const elem: any = this.elem as HTMLElement & {
            requestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            webkitRequestFullscreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
        };

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Mozilla
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Webkit (Safari/Chrome)
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
        }
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
