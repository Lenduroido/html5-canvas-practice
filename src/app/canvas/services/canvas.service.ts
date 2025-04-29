import { Injectable } from '@angular/core';

interface ICanvasObject {
    type: 'rect' | 'image' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    text?: string;
    fontName?: string;
    fontSize?: number;
    color?: string;
    src?: string;
    image?: HTMLImageElement;
    handles: {
        left: {x: number; y: number; };
        right: {x: number; y: number; };
        top: {x: number; y: number; };
        bottom: {x: number; y: number; };
        rotate: {x: number; y: number; };
    }
}

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
    public canvas: HTMLCanvasElement | null = null;
    public context: CanvasRenderingContext2D | null = null;
    private canvasWidth: number = 800;
    private canvasHeight: number = 600;
    private canvasBackgroundColor: string = '#ffffff';
    private defaultObjectColor: string = '#000000';
    private objects: ICanvasObject[] = [];
    private selectedObject: ICanvasObject | null = null;
    private borderColor: string = '#de920d';
    private borderWidth: number = 2;
    private handleColor: string = '#de920d';
    private handleSize: number = 8;
    private startX: number = 0;
    private startY: number = 0;
    private currentHandle: string | null = null;

    constructor() { }

    public init(
        canvas: HTMLCanvasElement,
        canvasWidth: number = 800,
        canvasHeight: number = 600,
        canvasBackgroundColor: string = '#ffffff'
    ): void {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvasBackgroundColor = canvasBackgroundColor;
        if (!this.context) return;

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.renderBackground();
        (window as any).objects = this.objects;
    }

    public addRectangle(
        x: number = this.canvasWidth / 2,
        y: number = this.canvasHeight / 2,
        width: number = this.canvasWidth / 4,
        height: number = this.canvasHeight / 4,
        color: string = this.defaultObjectColor
    ): void {
        if (!this.context) return;
        this.objects.push({
            type: 'rect',
            x: x - width / 2,
            y: y - height / 2,
            width: width,
            height: height,
            angle: 0,
            color: color,
            handles: this.getObjectHandles(x - width / 2, y - height / 2, width, height)
        });
        this.renderCanvas();
    }

    public addText(
        text: string = 'Your Text Here',
        x: number = this.canvasWidth / 2,
        y: number = this.canvasHeight / 2,
        color: string = this.defaultObjectColor,
    ): void {
        if (!this.context) return;
        const fontSize = 20;
        const fontName = 'Arial';
        this.context.font = `${fontSize}px ${fontName}`;
        const textWidth = this.context.measureText(text).width;
        const textHeight = fontSize;
        this.objects.push({
            type: 'text',
            x: x - textWidth / 2,
            y: y - textHeight / 2,
            width: textWidth,
            height: textHeight,
            angle: 0,
            text: text,
            fontSize: fontSize,
            color: color,
            fontName: fontName,
            handles: this.getObjectHandles(x - textWidth / 2, y - textHeight / 2, textWidth, textHeight)
        });
        this.renderCanvas();
    }

    public addImage(
        file: File,
        x: number = this.canvasWidth / 2,
        y: number = this.canvasHeight / 2
    ): void {
        if (!this.context) return;
        const src = URL.createObjectURL(file);
        const img = new Image();
        img.src = src;
        img.onload = () => {
            // get image dimensions
            const imgWidth = img.width;
            const imgHeight = img.height;
            const aspectRatio = imgWidth / imgHeight;
            let width = null;
            let height = null;
            if (imgWidth > imgHeight) {
                width = this.canvasWidth / 4;
                height = width / aspectRatio;
            } else {
                height = this.canvasHeight / 4;
                width = height * aspectRatio;
            }
            this.objects.push({
                type: 'image',
                x: x - width / 2,
                y: y - height / 2,
                width: width,
                height: height,
                angle: 0,
                src: src,
                image: img,
                handles: this.getObjectHandles(x - width / 2, y - height / 2, width, height)
            });
            this.renderCanvas();
        };
    }

    private getObjectHandles(
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        return {
            left: {
                x: x - this.handleSize / 2,
                y: y + height / 2 - this.handleSize / 2
            },
            right: {
                x: x + width - this.handleSize / 2,
                y: y + height / 2 - this.handleSize / 2
            },
            top: {
                x: x + width / 2 - this.handleSize / 2,
                y: y - this.handleSize / 2
            },
            bottom: {
                x: x + width / 2 - this.handleSize / 2,
                y: y + height - this.handleSize / 2
            },
            rotate: {
                x: x + width / 2 - this.handleSize / 2,
                y: y - this.handleSize / 2 - 25
            }
        };
    }

    public renderCanvas(): void {
        if (!this.context) return;
        this.clearCanvas();
        this.renderBackground();
        this.renderObjects();
        this.renderBorder();
        this.renderHandles();
    }

    public clearCanvas(clearObjects: boolean = false): void {
        if (!this.context) return;

        if (clearObjects) {
            this.objects = [];
            this.selectedObject = null;
        }
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    private renderBackground(): void {
        if (!this.context) return;
        this.context.fillStyle = this.canvasBackgroundColor;
        this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    private renderObjects(): void {
        if (!this.context) return;

        console.group('Rendering Objects');
        for (const object of this.objects) {
            console.log(`${object.type}:`, object);
            this.context.save();
            this.context.translate(
                object.x + object.width / 2,
                object.y + object.height / 2);
            this.context.rotate((object.angle * Math.PI) / 180);
            switch (object.type) {
                case 'rect':
                    this.context.fillStyle = object.color || this.defaultObjectColor;
                    this.context.fillRect(
                        -object.width / 2,
                        -object.height / 2,
                        object.width,
                        object.height);
                    break;
                case 'image':
                    if (!this.context) return;

                    if (!object.image) {
                        console.warn('Image not loaded yet:', object);
                        continue;
                    }
                    this.context.drawImage(
                        object.image,
                        -object.width / 2,
                        -object.height / 2,
                        object.width,
                        object.height);
                    break;
                case 'text':
                    this.context.fillStyle = object.color || this.defaultObjectColor;
                    this.context.font = `${object.fontSize}px ${object.fontName}`;
                    this.context.fillText(
                        object.text || '',
                        -object.width / 2,
                        ((-object.height / 2) + object.height) - 2.5,
                        object.width);
                    break;
                default:
                    console.warn(`Unknown object type: ${object.type}`);
                    break;
            }
            this.context.restore();
        }
        console.groupEnd();
    }

    private renderBorder() {
        if (!this.context || !this.selectedObject) return;
        const { x, y, width, height } = this.selectedObject;
        this.context.save();
        this.context.translate(
            x + width / 2,
            y + height / 2);
        this.context.rotate((this.selectedObject.angle * Math.PI) / 180);
        this.context.strokeStyle = this.borderColor;
        this.context.lineWidth = this.borderWidth;
        this.context.strokeRect(-width / 2, -height / 2, width, height);
        this.context.restore();
    }

    private renderHandles() {
        if (!this.context || !this.selectedObject) return;
        this.context.fillStyle = this.handleColor;
        const { x, y, width, height } = this.selectedObject;
        this.context.save();
        this.context.translate(
            x + width / 2,
            y + height / 2);
        this.context.rotate((this.selectedObject.angle * Math.PI) / 180);
        const rotatedHandleCoords = this.getObjectHandles(-width / 2, -height / 2, width, height);
        for (const key of Object.keys(rotatedHandleCoords)) {
            const handle = rotatedHandleCoords[key as keyof ICanvasObject['handles']];
            if (key === 'rotate') {
                this.context.beginPath();
                this.context.moveTo(0, -height / 2);
                this.context.lineTo(handle.x + this.handleSize / 2, handle.y + this.handleSize / 2);
                this.context.strokeStyle = this.handleColor;
                this.context.lineWidth = this.borderWidth;
                this.context.stroke();
                this.context.closePath();
            }
            this.context.fillRect(handle.x, handle.y, this.handleSize, this.handleSize);
        }
        this.context.restore();
    }

    // Canvas Actions Handlers
    public isMouseInObject(event: MouseEvent): number {
        const { x, y } = this.getCanvasMousePosition(event);
        const reverseObjects = [...this.objects].reverse();
        for (const object of reverseObjects) {
            if (x >= object.x && x <= object.x + object.width &&
                y >= object.y && y <= object.y + object.height
            ) {
                return this.objects.indexOf(object);
            }
        }
        return -1;
    }

    public isMouseInHandle(event: MouseEvent): string | false {
        const { x, y } = this.getCanvasMousePosition(event);
        if (this.selectedObject && this.selectedObject.handles) {
            for (const [key, handle] of Object.entries(this.selectedObject.handles)) {
                if (x >= handle.x && x <= handle.x + this.borderWidth * 4 &&
                    y >= handle.y && y <= handle.y + this.borderWidth * 4
                ) {
                    return key;
                }
            }
        }
        return false;
    }

    public selectObject(objectId: number): void {
        if (objectId < 0 || objectId >= this.objects.length) {
            console.error('Invalid object ID:', objectId);
            return;
        }
        this.selectedObject = this.objects[objectId];
        console.log('Selected Object:', this.selectedObject);
        this.renderCanvas();
    }

    public getCanvasMousePosition(event: MouseEvent): { x: number; y: number } {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x: x, y: y };
    }

    public setStartingMousePosition(event: MouseEvent, handleKey?: string): void {
        if (!this.canvas) return;
        const { x, y } = this.getCanvasMousePosition(event);
        this.startX = x;
        this.startY = y;
        this.currentHandle = handleKey || null;
    }

    public moveObject(event: MouseEvent): void {
        if (!this.canvas || !this.selectedObject) return;
        const { x, y } = this.getCanvasMousePosition(event);
        this.selectedObject.x = (x - this.startX) + this.selectedObject.x;
        this.selectedObject.y = (y - this.startY) + this.selectedObject.y;
        this.startX = x;
        this.startY = y;
        this.updateObjectHandles(this.selectedObject);
        this.renderCanvas();
    }

    public processHandle(event: MouseEvent): void {
        if (!this.canvas || !this.context || !this.selectedObject) return;

        const { x, y } = this.getCanvasMousePosition(event);
        switch (this.currentHandle) {
            case 'left':
                this.selectedObject.width += this.startX - x;
                this.selectedObject.x = x;
                break;
            case 'right':
                this.selectedObject.width += x - this.startX;
                break;
            case 'top':
                this.selectedObject.height += this.startY - y;
                this.selectedObject.y = y;
                break;
            case 'bottom':
                this.selectedObject.height += y - this.startY;
                break;
            case 'rotate':
                const centerX = this.selectedObject.x + this.selectedObject.width / 2;
                const centerY = this.selectedObject.y + this.selectedObject.height / 2;
                let angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
                if (angle < 0) {
                    angle += 2 * Math.PI;
                }
                this.selectedObject.angle = angle * (180 / Math.PI);
                break;
            default:
                console.warn('Unknown handle:', this.currentHandle);
                break;
        }

        if (this.selectedObject.type === 'text') {
            this.selectedObject.fontSize = this.selectedObject.height;
        }

        this.startX = x;
        this.startY = y;
        this.updateObjectHandles(this.selectedObject);
        this.renderCanvas();
    }

    private updateObjectHandles(selectedObject: ICanvasObject): void {
        if (!this.canvas) return;
        selectedObject.handles = this.getObjectHandles(
            selectedObject.x,
            selectedObject.y,
            selectedObject.width,
            selectedObject.height
        );
    }
}
