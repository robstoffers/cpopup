import { CPopup } from './popup';
import { HorizontalStrategy, PopupPositions, VerticalStrategy } from './popup.interfaces';
import { getAllPropertyNames, fromSpinal, toSpinal } from './util';

export class CPopupComponent extends HTMLElement {
    private _implementation: CPopup;

    get isOpen(): boolean { return this._implementation.isOpen; }

    set borderWidth(n: number) { this._implementation.borderWidth = n; }
    get borderWidth(): number { return this._implementation.borderWidth; }

    set cornerRadius(n: number) { this._implementation.cornerRadius = n; }
    get cornerRadius(): number { return this._implementation.cornerRadius; }

    set background(b: any) { this._implementation.background = b; }
    get background(): any { return this._implementation.background; }

    set borderColor(b: any) { this._implementation.borderColor = b; }
    get borderColor(): any { return this._implementation.borderColor; }

    set shadowColor(c: string) { this._implementation.shadowColor = c; }
    get shadowColor(): any { return this._implementation.shadowColor; }

    set shadowBlur(n: number) { this._implementation.shadowBlur = n; }
    get shadowBlur(): any { return this._implementation.shadowBlur; }

    set shadowOffsetX(n: number) { this._implementation.shadowOffsetX = n; }
    get shadowOffsetX(): any { return this._implementation.shadowOffsetX; }

    set shadowOffsetY(n: number) { this._implementation.shadowOffsetY = n; }
    get shadowOffsetY(): any { return this._implementation.shadowOffsetY; }

    set animationDuration(n: number) { this._implementation.animationDuration = n; }
    get animationDuration(): any { return this._implementation.animationDuration; }

    constructor() {
        super();
        this._implementation = new CPopup();
        this._implementation.executionContext = window.requestAnimationFrame.bind(window);
    }

    connectedCallback() {
        this._implementation.provideContainer(this);
    }

    disconnectedCallback() {
        this._implementation.provideContainer(null);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        name = fromSpinal(name);
        this[name] = newValue;
    }

    public show(target: HTMLElement, position: PopupPositions): void {
        this._implementation.show(target, position);
    }
    public showAt(x: number, y: number, horizontal: HorizontalStrategy = "left", vertical: VerticalStrategy = "top"): void {
        this._implementation.showAt(x, y, horizontal, vertical);
    }
    public move(target: HTMLElement, position: PopupPositions): void {
        this._implementation.move(target, position);
    }
    public moveTo(x: number, y: number, horizontal: HorizontalStrategy = "left", vertical: VerticalStrategy = "top") {
        this._implementation.moveTo(x, y, horizontal, vertical);
    }
    public hide(): void {
        this._implementation.hide();
    }

    static get observedAttributes() {
        let names = getAllPropertyNames(CPopupComponent);
        for (let i = 0; i < names.length; i++) {
            names[i] = toSpinal(names[i]);
        }
        return names;              
    }  

    /*
     * Register the component so it can be used from markup.
     */
    public static register(): void {
        const htmlTagName: string = "c-popup";
        if (!window.customElements.get(htmlTagName)) {
            window.customElements.define(htmlTagName, CPopupComponent);
        }
    }
}