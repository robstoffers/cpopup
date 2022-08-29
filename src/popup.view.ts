import { CPopup } from "./popup";
import { Rect, Size, ArrowPositions } from "./popup.interfaces";
import { rect } from "./util";

export class CPopupView {
    private _model: CPopup;

    private _container: HTMLElement | null = null;
    private _root: HTMLDivElement;
    private _content: HTMLDivElement;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D | null;

    constructor(model: CPopup) {
        this._model = model;
    }

    public provideContainer(container: any): void {
        if (this._container) {
            // cleanup.
            this._container = null;
        }
        this._container = <HTMLElement>container;

        this._root = document.createElement("div");
        this._root.style.position = "absolute";

        this._canvas = document.createElement("canvas");
        this._canvas.style.position = "absolute";
        this._canvas.style.pointerEvents = "none";
        this._root.append(this._canvas);

        this._content = document.createElement("div");
        this._content.style.position = "relative";
        this._content.style.boxSizing = "border-box";
        this._content.style.padding = "5px";
        this._root.append(this._content);
    
        this._ctx = this._canvas.getContext('2d');

        // todo: Maybe do this a different way. As it stands right now, if we remove the elements from
        // the <c-popup> element like this users won't be able to grab them after this point because they
        // won't be in the DOM until the popup is shown. Maybe it doesn't matter much in the long run because
        // there might be other ways to do what they need...
        while (this._container.children.length > 0) {
            let child = this._container.children.item(0);
            if (child) {
                child.remove();
                this._content.append(child);
            }
        }
    }

    /**
     * Measure the content and return a desired size.
     */
    public measureContent(): Size {
        // the element needs to be in the dom so it can be measured.
        if (!this._root.parentElement) {
            this._root.style.visibility = "hidden";
            document.body.append(this._root);
        }
        let w = this._content.offsetWidth;
        let h = this._content.offsetHeight;
        this._root.remove();
        this._root.style.visibility = "unset";

        return { width: w, height: h };
    }

    public show(ax: number, ay: number, ap: ArrowPositions) {
        this._root.style.width = "unset";
        this._root.style.height = "unset";
        this.opacityChanged();

        document.body.append(this._root);

        // configure the dom elements.
        this._root.style.width = this._model.contentSize.width + "px";
        this._root.style.height = this._model.contentSize.height + "px";
        this.updateCanvas(this._model.canvasInfo);

        this.draw(ax, ay, ap);
    }

    public hide(): void {
        this._root.remove();
    }

    public updateCanvas(r: Rect): void {
        this._canvas.width = r.width;
        this._canvas.height = r.height;
        this._canvas.style.width = r.width + 'px';
        this._canvas.style.height = r.height + 'px';
        this._canvas.style.left = r.x + 'px';
        this._canvas.style.top = r.y + 'px';
    }

    public getBoundingRect(target: HTMLElement): DOMRect {
        return target.getBoundingClientRect();
    }

    public getContainerBounds(): Rect {
        return rect(0, 0, window.innerWidth, window.innerHeight);
    }

    public opacityChanged(): void {
        this._root.style.opacity = `${this._model.opacity}`;
    }

    public positionChanged(): void {
        this._root.style.left = this._model.position.x + 'px';
        this._root.style.top = this._model.position.y + 'px';
    }

    private drawShape(arrowX: number, arrowY: number, arrowPosition: string = "none"): void {
        if (!this._ctx) {
            return;
        }

        let r = this._model.cornerRadius;
        let h = this._model.contentSize.height;
        let w = this._model.contentSize.width;
        
        var topLeftCurve = { startx: r, starty: 0, endx: 0, endy: r, cpx: 0, cpy: 0 };
        var botLeftCurve = { startx: 0, starty: h - r, endx: r, endy: h, cpx: 0, cpy: h };
        var botRightCurve = { startx: w - r, starty: h, endx: w, endy: h - r, cpx: w, cpy: h };
        var topRightCurve = { startx: w, starty: r, endx: w - r, endy: 0, cpx: w, cpy: 0 };

        if (arrowPosition === 'top' || arrowPosition === 'bottom') {
            if (arrowX > w - (this._model.arrowWidth * 0.5)) {
                arrowX = w - (this._model.arrowWidth * 0.5);
            }
            if (arrowX < (this._model.arrowWidth * 0.5)) {
                arrowX = (this._model.arrowWidth * 0.5);
            }

            if (arrowPosition === 'top') {
                if (arrowX + (this._model.arrowWidth * 0.5) > topRightCurve.endx) {
                    topRightCurve.endx = arrowX + (this._model.arrowWidth * 0.5);
                }
                if (arrowX - (this._model.arrowWidth * 0.5) < topLeftCurve.startx) {
                    topLeftCurve.startx = arrowX - (this._model.arrowWidth * 0.5);
                }
            } else {
                if (arrowX + (this._model.arrowWidth * 0.5) > botRightCurve.startx) {
                    botRightCurve.startx = arrowX + (this._model.arrowWidth * 0.5);
                }
                if (arrowX - (this._model.arrowWidth * 0.5) < botLeftCurve.endx) {
                    botLeftCurve.endx = arrowX - (this._model.arrowWidth * 0.5);
                }
            }
        }
        if (arrowPosition === 'left' || arrowPosition === 'right') {
            if (arrowY > h - (this._model.arrowWidth * 0.5)) {
                arrowY = h - (this._model.arrowWidth * 0.5);
            }
            if (arrowY < (this._model.arrowWidth * 0.5)) {
                arrowY = (this._model.arrowWidth * 0.5);
            }

            if (arrowPosition === 'left') {
                if (arrowY - (this._model.arrowWidth * 0.5) < topLeftCurve.endy) {
                    topLeftCurve.endy = arrowY - (this._model.arrowWidth * 0.5);
                }
                if (arrowY + (this._model.arrowWidth * 0.5) > botLeftCurve.starty) {
                    botLeftCurve.starty = arrowY + (this._model.arrowWidth * 0.5);
                }
            } else {
                if (arrowY - (this._model.arrowWidth * 0.5) < topRightCurve.starty) {
                    topRightCurve.starty = arrowY - (this._model.arrowWidth * 0.5);
                }
                if (arrowY + (this._model.arrowWidth * 0.5) > botRightCurve.endy) {
                    botRightCurve.endy = arrowY + (this._model.arrowWidth * 0.5);
                }
            }
        }

        this._ctx.translate(-this._model.canvasInfo.x, -this._model.canvasInfo.y);
        this._ctx.beginPath();
        this._ctx.moveTo(topLeftCurve.endx, topLeftCurve.endy);

        if (arrowPosition === 'left') {
            this._ctx.lineTo(topLeftCurve.endx, arrowY - (this._model.arrowWidth * 0.5));
            this._ctx.lineTo(topLeftCurve.endx - this._model.arrowHeight, arrowY);
            this._ctx.lineTo(topLeftCurve.endx, arrowY + (this._model.arrowWidth * 0.5));
        }

        this._ctx.lineTo(botLeftCurve.startx, botLeftCurve.starty);
        this._ctx.quadraticCurveTo(botLeftCurve.cpx, botLeftCurve.cpy, botLeftCurve.endx, botLeftCurve.endy);

        if (arrowPosition === 'bottom') {
            this._ctx.lineTo(arrowX - (this._model.arrowWidth * 0.5), botLeftCurve.endy);
            this._ctx.lineTo(arrowX, botLeftCurve.endy + this._model.arrowHeight);
            this._ctx.lineTo(arrowX + (this._model.arrowWidth * 0.5), botLeftCurve.endy);
        }

        this._ctx.lineTo(botRightCurve.startx, botRightCurve.starty);
        this._ctx.quadraticCurveTo(botRightCurve.cpx, botRightCurve.cpy, botRightCurve.endx, botRightCurve.endy);

        if (arrowPosition === 'right') {
            this._ctx.lineTo(botRightCurve.endx, arrowY + (this._model.arrowWidth * 0.5));
            this._ctx.lineTo(botRightCurve.endx + this._model.arrowHeight, arrowY);
            this._ctx.lineTo(botRightCurve.endx, arrowY - (this._model.arrowWidth * 0.5));
        }

        this._ctx.lineTo(topRightCurve.startx, topRightCurve.starty);
        this._ctx.quadraticCurveTo(topRightCurve.cpx, topRightCurve.cpy, topRightCurve.endx, topRightCurve.endy);

        if (arrowPosition === 'top') {
            this._ctx.lineTo(arrowX + (this._model.arrowWidth * 0.5), topRightCurve.endy);
            this._ctx.lineTo(arrowX, topRightCurve.endy - this._model.arrowHeight);
            this._ctx.lineTo(arrowX - (this._model.arrowWidth * 0.5), topRightCurve.endy);
        }

        this._ctx.lineTo(topLeftCurve.startx, topLeftCurve.starty);
        this._ctx.quadraticCurveTo(topLeftCurve.cpx, topLeftCurve.cpy, topLeftCurve.endx, topLeftCurve.endy);
        this._ctx.closePath();
    }

    public draw(arrowX: number, arrowY: number, arrowPosition: string): void {
        if (!this._ctx) {
            return;
        }

        this._ctx.clearRect(0, 0, this._model.canvasInfo.width, this._model.canvasInfo.height);
    
		// draw the fill first:
        this._ctx.save();
        this.drawShape(arrowX, arrowY, arrowPosition);
        this._ctx.shadowOffsetX = this._model.shadowOffsetX;
        this._ctx.shadowOffsetY = this._model.shadowOffsetY;
        this._ctx.shadowColor = this._model.shadowColor;
        this._ctx.shadowBlur = this._model.shadowBlur;
        this._ctx.fillStyle = this._model.background;
        this._ctx.fill();
        this._ctx.restore();
        
        // Draw the stroke next.
        if (this._model.borderWidth > 0) {
            this._ctx.save();
            this._ctx.lineJoin = "round";
            this.drawShape(arrowX, arrowY, "none");
            this._ctx.lineWidth = this._model.borderWidth;
            this._ctx.strokeStyle = this._model.borderColor;;
            this._ctx.stroke();
            this._ctx.restore();
        }
    }
}