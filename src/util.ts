import { Rect } from './popup.interfaces';

export function getAllPropertyNames(comp: any): string[] {
    let members: string[] = [];
    while (comp = (comp.prototype || Object.getPrototypeOf(comp))) {
        if (comp == HTMLElement.prototype) {
            break;
        }
        let props = Object.getOwnPropertyNames(comp.constructor.prototype);
        for (let i = 0; i < props.length; i++) {
            members.push(props[i])
        }
    }
    return members;
}

export function toSpinal(value: string): string {

    let output: any[] = [];
    let upperRun: number = 0;

    for (let i = 0; i < value.length; i++) {
        var curr = value[i];

        var upperChar = curr.toUpperCase();
        var lowerChar = curr.toLowerCase();

        let charIsNewWord = (upperRun == 0 && output.length > 0);
        let previousCharWasNewWord = (upperRun > 1);

        if (upperChar == curr) {
            if (charIsNewWord) {
                output.push('-');
            }
            upperRun++;
        }
        else if (lowerChar == curr) {
            if (previousCharWasNewWord) {
                output.splice(output.length - 1, 0, '-');
            }
            upperRun = 0;
        }
        else {
            upperRun = 0;
        }

        output.push(lowerChar);
    }

    let sb = "";
    for (let i = 0; i < output.length; i++) {
        sb += output[i];
    }
    return sb;
}

export function fromSpinal(value: string): string {
    if (value == null) {
        return value;
    }
    let parts = value.split('-');
    for (let j = 1; j < parts.length; j++) {
        parts[j] = parts[j].substr(0, 1).toUpperCase() + parts[j].substr(1);
    }
    let ret = "";
    for (let j = 0; j < parts.length; j++) {
        ret += parts[j];
    }
    return ret;
}

export function ensureBool(v: any): boolean {
    if (v == null) {
        return false;
    }
    if (typeof v == "boolean") {
        return v;
    }
    return v.toString().toLowerCase() == "true";
}

export function lerp (start: number, end: number, amt: number): number {
    return (1-amt)*start+amt*end
}

export function rect(x: number, y: number, width: number, height: number): Rect {
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        left: x,
        top: y,
        right: x + width,
        bottom: y + height
    }
}