import { CPopupView } from './popup.view';
import { Point, PopupPositionInfo, PopupPositions, Rect, Size, HorizontalStrategy, VerticalStrategy } from './popup.interfaces';
import { lerp, rect } from './util';

export class CPopup {
    private _view: CPopupView;
    private _contentSize: Size;
    get contentSize(): Size {
        return this._contentSize;
    }
    private _canvasInfo: Rect;
    get canvasInfo(): Rect {
        return this._canvasInfo;
    }
    private _boundaryOffset: number = 8;

    //#region Animation Stuff 
    private _opacity: number = 0;
    set opacity(n: number) {
        const old = this._opacity;
        this._opacity = n;
        if (old !== this._opacity) {
            this.onPropertyChanged("opacity", this._opacity, old);
        }
    }
    get opacity(): number {
        return this._opacity;
    }

    private _position: Point;
    set position(p: Point) {
        const old = this._position;
        this._position = p;
        if (old !== this._position) {
            this.onPropertyChanged("position", this._position, old)
        }
    }
    get position(): Point { return this._position; }

    private _startPosition: Point;
    set startPosition(p: Point) { this._startPosition = p; }
    get startPosition(): Point { return this._startPosition; }

    private _desiredPosition: Point;
    set desiredPosition(p: Point) { this._desiredPosition = p; }
    get desiredPosition(): Point { return this._desiredPosition; }

    private _start: number;
    private _resolvedArrowHeight: number;
    //#endregion

    private _arrowHeight: number = 10;
    set arrowHeight(n: number) { this._arrowHeight = n; }
    get arrowHeight(): number { return this._arrowHeight; }

    private _arrowWidth: number = 20;
    set arrowWidth(n: number) { this._arrowWidth = n; }
    get arrowWidth(): number { return this._arrowWidth; }

    private _borderWidth: number = 0;
    set borderWidth(n: number) { this._borderWidth = n; }
    get borderWidth(): number { return this._borderWidth; }

    private _cornerRadius: number = 0;
    set cornerRadius(n: number) { this._cornerRadius = n; }
    get cornerRadius(): number { return this._cornerRadius; }

    private _background: any = "aliceblue";
    set background(b: any) { this._background = b; }
    get background(): any { return this._background; }

    private _borderColor: any = "black";
    set borderColor(b: any) { this._borderColor = b; }
    get borderColor(): any { return this._borderColor; }

    private _shadowColor: string = 'rgba(0,0,0,0.7)';
    set shadowColor(c: string) { this._shadowColor = c; }
    get shadowColor(): any { return this._shadowColor; }

    private _shadowBlur: number = 5;
    set shadowBlur(n: number) { this._shadowBlur = n; }
    get shadowBlur(): any { return this._shadowBlur; }

    private _shadowOffsetX: number = 2;
    set shadowOffsetX(n: number) { this._shadowOffsetX = n; }
    get shadowOffsetX(): any { return this._shadowOffsetX; }

    private _shadowOffsetY: number = 2;
    set shadowOffsetY(n: number) { this._shadowOffsetY = n; }
    get shadowOffsetY(): any { return this._shadowOffsetY; }

    private _animationDuration: number = 0.2;
    set animationDuration(n: number) { this._animationDuration = n; }
    get animationDuration(): any { return this._animationDuration; }
    
    private _animationOffset: number = 10;
    set animationOffset(n: number) { this._animationOffset = n; }
    get animationOffset(): any { return this._animationOffset; }

    private _isOpen: boolean = false;
    get isOpen(): boolean { return this._isOpen; }

    private _executionContext: (callback: any) => void;
    set executionContext(context: (callback: any) => void) {
        this._executionContext = context;
    }
    get executionContext(): (callback: any) => void {
        return this._executionContext;
    }

    constructor() {
        this._view = new CPopupView(this);
        
        // bind up so we get the right 'this' in the function.
        this.animate = this.animate.bind(this);
    }

    public provideContainer(container: any) {
        this._view.provideContainer(container);
    }

    /**
     * Shows the popup at the specified target.
     * @param target The target element.
     * @param position The location around the target where the popup will display.
     */
    public show(target: any, position: PopupPositions) {
        if (!this.isOpen) {
            this._isOpen = true;

            // todo: Reset animation settings.
            (<any>this._start) = undefined;
            this._opacity = 0;

            // todo: Measure the popup content.
            this._contentSize = this.measureContent();

            // todo: Resolve the popup position if needed.
            this._resolvedArrowHeight = this.arrowHeight;
            const targetRect = this._view.getBoundingRect(target);
            if (position === "auto") {
                const bounds = this._view.getContainerBounds();
                position = this.resolveAutoPosition(targetRect, bounds.width, bounds.height);
            }
            
            // todo: Measure the canvas.
            this._canvasInfo = this.measureCanvas(position);

            // todo: Calculate the optimal position for the popup in relation to the target.
            const desiredPosition = this.getOptimalPosition(targetRect, position);
            this.desiredPosition = { x: desiredPosition.x, y: desiredPosition.y };
            this.startPosition = { x: desiredPosition.sx, y: desiredPosition.sy };

            // todo: Show the popup.
            this._view.show(desiredPosition.ax, desiredPosition.ay, desiredPosition.ap);

            // todo: Start any animations.
            this.executionContext(this.animate);
        }
    }

    /**
     * Shows the popup at the specified location.
     */
    public showAt(x: number, y: number, horizontal: HorizontalStrategy = "left", vertical: VerticalStrategy = "top") {
        if (!this.isOpen) {
            this._isOpen = true;

            // todo: Reset animation settings.
            (<any>this._start) = undefined;
            this._opacity = 0;

            // todo: Measure the popup content.
            this._contentSize = this.measureContent();

            // todo: Measure the canvas.
            this._resolvedArrowHeight = 0;
            this._canvasInfo = this.measureCanvas("auto");

            // todo: Calculate the optimal position for the popup based on position strategy.
            this.desiredPosition = { x: x, y: y };
            switch (horizontal) {
                case "center":
                    this.desiredPosition.x = x - (this._contentSize.width / 2);
                    break;
                case "right":
                    this.desiredPosition.x = x - this._contentSize.width;
                    break;
            }
            switch (vertical) {
                case "center":
                    this.desiredPosition.y = y - (this._contentSize.height / 2);
                    break;
                case "bottom":
                    this.desiredPosition.y = y - this._contentSize.height;
                    break;
            }
            this.startPosition = { x: this.desiredPosition.x, y: this.desiredPosition.y - this._animationOffset };

            // todo: Show the popup.
            this._view.show(0, 0, "none");

            // todo: Start any animations.
            this.executionContext(this.animate);
        }
    }

    public hide() {
        if (this.isOpen) {
            this._view.hide();
            this._isOpen = false;
        }
    }

    public move(target: any, position: PopupPositions): void {
        if (this.isOpen) {
            const targetRect = this._view.getBoundingRect(target);
            if (position === "auto") {
                const bounds = this._view.getContainerBounds();
                position = this.resolveAutoPosition(targetRect, bounds.width, bounds.height);
            }

            this._canvasInfo = this.measureCanvas(position);

            const desiredPosition = this.getOptimalPosition(targetRect, position);
            this.position = { x: desiredPosition.x, y: desiredPosition.y };

            this._view.updateCanvas(this.canvasInfo);            
            this._view.draw(desiredPosition.ax, desiredPosition.ay, desiredPosition.ap);
        }
    }

    public moveTo(x: number, y: number, horizontal: HorizontalStrategy = "left", vertical: VerticalStrategy = "top"): void {
        if (this.isOpen) {
            const position = { x: x, y: y };
            switch (horizontal) {
                case "center":
                    position.x = x - (this._contentSize.width / 2);
                    break;
                case "right":
                    position.x = x - this._contentSize.width;
                    break;
            }
            switch (vertical) {
                case "center":
                    position.y = y - (this._contentSize.height / 2);
                    break;
                case "bottom":
                    position.y = y - this._contentSize.height;
                    break;
            }
            this.position = position;
        }
    }

    private resolveAutoPosition(target: Rect, containerWidth: number, containerHeight: number, boundaryOffset: number = 8): PopupPositions {
        const windowWidth = containerWidth;
        const windowHeight = containerHeight;
        
        const topSpace = target.top - boundaryOffset;
        const bottomSpace = windowHeight - boundaryOffset - target.bottom;
        const leftSpace = target.left - boundaryOffset;
        const rightSpace = windowWidth - boundaryOffset - target.right;
        let largestSpace = topSpace;
        let largestArea: "top" | "bottom" | "left" | "right" = "top";
        if (largestSpace < bottomSpace) {
            largestSpace = bottomSpace;
            largestArea = "bottom";
        }
        if (largestSpace < leftSpace) {
            largestSpace = leftSpace;
            largestArea = "left";
        }
        if (largestSpace < rightSpace) {
            largestSpace = rightSpace;
            largestArea = "right";
        }

        const popupHeight = this._resolvedArrowHeight + this._contentSize.height;
        const popupWidth = this._resolvedArrowHeight + this._contentSize.width;
        // check if bottom space is available
        if (popupHeight > bottomSpace) {
            // no space at bottom, check the top.
            if (popupHeight > topSpace) {
                // no space at the top either, check sides.
                if (popupWidth > leftSpace) {
                    // no space to the left, is there space to the right?
                    if (popupWidth > rightSpace) {
                        // no space on the right either so resolve to top or bottom based on which has more room.
                        return largestArea;
                    } else {
                        "right";
                    }
                } else {
                    return "left";
                }
            } else {
                // there is space up top but see if there's space to fit the popup square above target.
                const offsetX = this._contentSize.width / 2 - target.width / 2;
                if (target.x - offsetX < boundaryOffset) {
                    // no space on the left side, check right...
                    if (target.right + offsetX > windowWidth - boundaryOffset) {
                        // no space on the right either so just resolve to top
                        return "top";
                    } else {
                        // there's no space to squarely fit on bottom.
                        if (target.right + this._resolvedArrowHeight + this._contentSize.width < windowWidth - boundaryOffset) {
                            return "right";
                        } else if (target.x - this._resolvedArrowHeight - this._contentSize.width > boundaryOffset) {
                            return "left";
                        } else {
                            return "top";
                        }
                    }
                } else {
                    if (target.right + offsetX < windowWidth - boundaryOffset) {
                        // there's space on both the left and right to squarely fit on bottom.
                        return "top";
                    } else {
                        // there's no space to squarely fit on bottom.
                        if (target.x - this._resolvedArrowHeight - this._contentSize.width > boundaryOffset) {
                            return "left";
                        } else if (target.right + this._resolvedArrowHeight + this._contentSize.width < windowWidth - boundaryOffset) {
                            return "right";
                        } else {
                            return "top";
                        }
                    }
                }
            }
        } else {
            // there is space but see if there's space to fit the popup square below the target.
            const offsetX = this._contentSize.width / 2 - target.width / 2;
            if (target.x - offsetX < boundaryOffset) {
                // no space on left side, check right...
                if (target.right + offsetX > windowWidth - boundaryOffset) {
                    // no space on the right either so just resolve to bottom
                    return "bottom";
                } else {
                    // there's no space to squarely fit on bottom.
                    if (popupWidth < rightSpace) {
                        return "right";
                    } else if (popupWidth < leftSpace) {
                        return "left";
                    } else {
                        return "bottom";
                    }
                }
            } else {
                if (target.right + offsetX < windowWidth - boundaryOffset) {
                    // there's space on both the left and right to squarely fit on bottom.
                    return "bottom";
                } else {
                    // there's no space to squarely fit on bottom.
                    if (target.x - this._resolvedArrowHeight - this._contentSize.width > boundaryOffset) {
                        return "left";
                    } else if (target.right + this._resolvedArrowHeight + this._contentSize.width < windowWidth - boundaryOffset) {
                        return "right";
                    } else {
                        return "bottom";
                    }
                }
            }
        }
        return "bottom";
    }

    private measureContent(): Size {
        return this._view.measureContent();
    }

    private measureCanvas(position: PopupPositions): Rect {
        let isArrowVisible = this._resolvedArrowHeight > 0;
        let isArrowIncludedInWidth = position === 'left' || position === 'right';
        let arrowSize = isArrowVisible && isArrowIncludedInWidth ? this._resolvedArrowHeight : 0;
        const x = -(this.borderWidth / 2 + arrowSize + Math.max(0, this.shadowBlur - this.shadowOffsetX));
        const w =
            this._contentSize.width +
            this.borderWidth +
            arrowSize +
            (this.shadowBlur * 2) +
            Math.abs(this.shadowOffsetX);
        
        let isArrowIncludedInHeight = position === 'top' || position === 'bottom';
        arrowSize = isArrowVisible && isArrowIncludedInHeight ? this._resolvedArrowHeight : 0;
        const y = -(this.borderWidth / 2 + arrowSize + Math.max(0, this.shadowBlur - this.shadowOffsetY));
        const h = 
            this._contentSize.height +
            this.borderWidth +
            arrowSize +
            (this.shadowBlur * 2) +
            Math.abs(this.shadowOffsetY);

        return rect(x, y, w, h);
    }

    private getOptimalPosition(target: Rect, position: PopupPositions): PopupPositionInfo {
        if (position === "bottom") {
            let offsetX = this._contentSize.width / 2 - target.width / 2;
            let x = target.x - offsetX;
            let y = target.bottom + this._resolvedArrowHeight;

            let ax = this._contentSize.width / 2;
            let ay = 0;

            if (x < this._boundaryOffset) {
                const offset = Math.abs(x) + this._boundaryOffset
                x += offset;
                ax -= offset;
            } else if (x + this._contentSize.width > window.innerWidth - this._boundaryOffset) {
                const offset = (x + this._contentSize.width) - (window.innerWidth - this._boundaryOffset);
                x -= offset;
                ax += offset;
            }

            return { x: x, y: y, sx: x, sy: y - this._animationOffset, ax: ax, ay: ay, ap: "top" };
        } else if (position === "top") {
            let offsetX = this._contentSize.width / 2 - target.width / 2;
            let x = target.x - offsetX;
            let y = target.top - this._resolvedArrowHeight - this._contentSize.height;

            let ax = this._contentSize.width / 2;
            let ay = 0;

            if (x < this._boundaryOffset) {
                const offset = Math.abs(x) + this._boundaryOffset
                x += offset;
                ax -= offset;
            } else if (x + this._contentSize.width > window.innerWidth - this._boundaryOffset) {
                const offset = (x + this._contentSize.width) - (window.innerWidth - this._boundaryOffset);
                x -= offset;
                ax += offset;
            }

            return { x: x, y: y, sx: x, sy: y + this._animationOffset, ax: ax, ay: ay, ap: "bottom" };
        } else if (position === "right") {
            let x = target.x + target.width + this._resolvedArrowHeight;
            
            let offsetY = this._contentSize.height / 2 - target.height / 2;
            let y = target.y - offsetY;

            let ax = 0;
            let ay = this._contentSize.height / 2;

            if (y < this._boundaryOffset) {
                const offset = Math.abs(y) + this._boundaryOffset
                y += offset;
                ay -= offset;
            } else if (y + this._contentSize.height > window.innerHeight - this._boundaryOffset) {
                const offset = (y + this._contentSize.height) - (window.innerHeight - this._boundaryOffset);
                y -= offset;
                ay += offset;
            }
            
            return { x: x, y: y, sx: x - this._animationOffset, sy: y, ax: ax, ay: ay, ap: "left" };
        }  else if (position === "left") {
            let x = target.left - this._resolvedArrowHeight - this._contentSize.width
            
            let offsetY = this._contentSize.height / 2 - target.height / 2;
            let y = target.y - offsetY;

            let ax = 0;
            let ay = this._contentSize.height / 2;

            if (y < this._boundaryOffset) {
                const offset = Math.abs(y) + this._boundaryOffset
                y += offset;
                ay -= offset;
            } else if (y + this._contentSize.height > window.innerHeight - this._boundaryOffset) {
                const offset = (y + this._contentSize.height) - (window.innerHeight - this._boundaryOffset);
                y -= offset;
                ay += offset;
            }
            
            return { x: x, y: y, sx: x + this._animationOffset, sy: y, ax: ax, ay: ay, ap: "right" };
        }
        return { x: 0, y: 0, sx: 0, sy: 0, ax: 0, ay: 0, ap: "none" };
    }

    private animate(timestamp) {
        if (this._start === undefined) {
            this._start = timestamp;
        }
        const elapsed = (timestamp - this._start) / 1000;

        this.opacity = lerp(0, 1, elapsed / this.animationDuration);
        let px = lerp(this._startPosition.x, this._desiredPosition.x, elapsed / this.animationDuration);
        let py = lerp(this._startPosition.y, this._desiredPosition.y, elapsed / this.animationDuration);
        this.position = { x: px, y: py };

        if (elapsed < this.animationDuration) {
            this.executionContext(this.animate);
        }
    }

    private onPropertyChanged(property: string, newValue: any, oldValue: any): void {
        switch (property) {
            case "opacity":
                this._view.opacityChanged();
                break;
            case "position":
                this._view.positionChanged();
                break;
        }
    }
}