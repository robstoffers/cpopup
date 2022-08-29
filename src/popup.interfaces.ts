export interface PopupPositionInfo {
    /**
     * The desired x position of the popup.
     */
    x: number;
    /**
     * The desired y position of the popup.
     */
    y: number;
    /**
     * The start x position for animation.
     */
    sx: number;
    /**
     * The start y position for animation.
     */
    sy: number;
    /**
     * The arrow x position along the popup side.
     */
    ax: number;
    /**
     * The arrow y position along the popup side.
     */
    ay: number;
    /**
     * The arrow position.
     */
    ap: "none" | "top" | "bottom" | "left" | "right";
}

export interface PopupDimensionInfo {
    contentWidth: number;
    contentHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    canvasLeft: number;
    canvasTop: number;
}

export type PopupPositions = "auto" | "top" | "bottom" | "left" | "right";
export type ArrowPositions = "none" | "top" | "bottom" | "left" | "right";
export type HorizontalStrategy = "left" | "center" | "right";
export type VerticalStrategy = "top" | "center" | "bottom";

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
}