import { ICategory } from "./icategory";

export interface IComponentState {
    version: string;
    categories: ICategory[];
    elem: HTMLElement | null;
}
