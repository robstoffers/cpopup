import { CPopup } from './popup';
import { HorizontalStrategy, PopupPositions, VerticalStrategy } from './popup.interfaces';
import { getAllPropertyNames, fromSpinal, toSpinal, ensureBool } from './util';

export class CPopupComponent extends HTMLElement {
    private _implementation: CPopup;

    /**
     * Accessor for determining the popup state.
     */
    get isOpen(): boolean { return this._implementation.isOpen; }

    /**
     * The border thickness.
     */
    set borderWidth(n: number) { this._implementation.borderWidth = n; }
    get borderWidth(): number { return this._implementation.borderWidth; }

    /**
     * The radius of the corners.
     */
    set cornerRadius(n: number) { this._implementation.cornerRadius = n; }
    get cornerRadius(): number { return this._implementation.cornerRadius; }

    /**
     * The color of the background.
     */
    set backgroundColor(b: any) { this._implementation.background = b; }
    get backgroundColor(): any { return this._implementation.background; }

    /**
     * The color of the border.
     */
    set borderColor(b: any) { this._implementation.borderColor = b; }
    get borderColor(): any { return this._implementation.borderColor; }

    /**
     * The color of the shadow.
     */
    set shadowColor(c: string) { this._implementation.shadowColor = c; }
    get shadowColor(): any { return this._implementation.shadowColor; }

    /**
     * Controls the amount of shadow.
     */
    set shadowBlur(n: number) { this._implementation.shadowBlur = n; }
    get shadowBlur(): any { return this._implementation.shadowBlur; }

    /**
     * Controls the X offset of the shadow.
     */
    set shadowOffsetX(n: number) { this._implementation.shadowOffsetX = n; }
    get shadowOffsetX(): any { return this._implementation.shadowOffsetX; }

    /**
     * Controls the Y offset of the shadow.
     */
    set shadowOffsetY(n: number) { this._implementation.shadowOffsetY = n; }
    get shadowOffsetY(): any { return this._implementation.shadowOffsetY; }

    /**
     * Controls the duration, in seconds, of the show animation.
     */
    set animationDuration(n: number) { this._implementation.animationDuration = n; }
    get animationDuration(): any { return this._implementation.animationDuration; }

    /**
     * If true, the popup will automatically dismiss when a mouse click is detected outside
     * of the popup.
     */
    set autoDismiss(b: boolean) { this._implementation.autoDismiss = ensureBool(b); }
    get autoDismiss(): boolean { return this._implementation.autoDismiss; }

    /**
     * Event fired when the popup is opened.
     */
    public open: (p: CPopupComponent) => void;

    /**
     * Event fired when the popup is closed.
     */
    public close: (p: CPopupComponent) => void;

    constructor() {
        super();

        this.onInternalOpen = this.onInternalOpen.bind(this);
        this.onInternalClose = this.onInternalClose.bind(this);

        this._implementation = new CPopup();
        this._implementation.executionContext = window.requestAnimationFrame.bind(window);
        this._implementation.open = this.onInternalOpen;
        this._implementation.close = this.onInternalClose;
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

    private onInternalOpen() {
        if (this.open) {
            this.open(this);
        }
    }
    private onInternalClose() {
        if (this.close) {
            this.close(this);
        }
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