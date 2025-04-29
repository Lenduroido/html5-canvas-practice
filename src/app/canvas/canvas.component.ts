import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasService } from './services/canvas.service';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
})
export class CanvasComponent implements AfterViewInit {
    @ViewChild('canvas') canvasElementRef: ElementRef<HTMLCanvasElement> | any;

    public canvasWidth: number = 800;
    public canvasHeight: number = 600;
    public canvasBackgroundColor: string = '#ffffff';

    private canvas: HTMLCanvasElement | null = null;
    private objectAction: false | 'moving' | 'resizing' | 'rotating' = false;

    constructor(
        private CanvasService: CanvasService
    ) {}

    ngAfterViewInit(): void {
        this.canvas = this.canvasElementRef.nativeElement;
        if (this.canvas) {
            this.CanvasService.init(
                this.canvas,
                this.canvasWidth,
                this.canvasHeight,
                this.canvasBackgroundColor
            );
        }
    }

    public onMouseDown(event: MouseEvent) {
        if (!this.canvas) return;
        const {x, y} = this.CanvasService.getCanvasMousePosition(event);
        console.log('Mouse Down:', x, y);

        const handleKey = this.CanvasService.isMouseInHandle(event);
        if (handleKey) {
            this.objectAction = 'resizing';
            this.CanvasService.setStartingMousePosition(event, handleKey);
            return;
        }

        const objectId = this.CanvasService.isMouseInObject(event);
        if (objectId >= 0) {
            this.CanvasService.selectObject(objectId);
            this.objectAction = 'moving';
            this.CanvasService.setStartingMousePosition(event);
        }

    }

    public onMouseUp(event: MouseEvent) {
        if (!this.canvas) return;
        this.objectAction = false;
    }

    public onMouseMove(event: MouseEvent) {
        if (!this.canvas) return;
        const objectId = this.CanvasService.isMouseInObject(event);
        this.canvas.style.cursor = objectId >= 0 ? 'move' : 'default';

        switch (this.objectAction) {
            case 'resizing':
            case 'rotating':
                this.canvas.style.cursor = 'crosshair';
                this.CanvasService.processHandle(event);
                break;
            case 'moving':
                this.CanvasService.moveObject(event);
                break;
            default:
                const handleKey = this.CanvasService.isMouseInHandle(event);
                if (handleKey) {
                    this.canvas.style.cursor = 'crosshair';
                }
                break;
        }
    }

    public onMouseLeave(event: MouseEvent) {
        if (!this.canvas) return;
        this.objectAction = false;
        this.canvas.style.cursor = 'default';
    }

    public onFileUpload(event: Event, fileInputEl: HTMLInputElement) {
        console.log('File Upload:', event);
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        this.CanvasService.addImage(file);
        fileInputEl.value = '';
    }

    public onInsertShape(shape: 'rect' | 'circle') {
        console.log('Insert Shape:', shape);
        switch (shape) {
            case 'rect':
                this.CanvasService.addRectangle();
                break;
            case 'circle':
                // this.CanvasService.addCircle();
                break;
            default:
                console.error('Unknown shape type:', shape);
                break;
        }
    }

    public onTextInput(value: string) {
        console.log('Text Input:', value);
    }

    public onInsertText(value: string, textInputEl: HTMLInputElement) {
        if (!value) {
            value = 'Your Text Here';
        }
        console.log('Insert Text:', value);
        this.CanvasService.addText(value);
        textInputEl.value = '';
    }

    public onClearCanvas() {
        console.log('Clear Canvas');
        this.CanvasService.clearCanvas(true);
    }
}
