import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class BranchTablesService {

    constructor() { }

    toggleDropdownVisibility(isDropdownVisible: boolean): [any, boolean] {
        const isDropdownVisibleNew = !isDropdownVisible;
        const isDropdownInSession = sessionStorage.getItem('branchTables');

        if (isDropdownInSession) {
            return [isDropdownInSession ? JSON.parse(isDropdownInSession) : null, isDropdownVisibleNew];
        } else {
            return [null, isDropdownVisibleNew];
        }
    }

    handleBranchTablesResult(result: any) {
        if (result) {
            sessionStorage.setItem('branchTables', JSON.stringify(result));
            return result;
        }
    }
}
