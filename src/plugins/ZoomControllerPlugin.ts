import { Container } from 'pixi.js';
import { AbstractPlugin } from './AbstractPlugin';
import { Events } from '../consts';

export class ZoomControllerPlugin extends AbstractPlugin {
    private minZoom = 0.1;
    private maxZoom = 5;
    private currentZoom = 1;
    private onZoomChange?: (zoom: number) => void;
    private isSpacePressed = false;
    private isDragging = false;
    private lastMousePosition = { x: 0, y: 0 };

    public init(): void {
        this.currentZoom = this.layers.mainZone.scale.x;
        this.app.canvas.addEventListener('contextmenu', this.handleContextMenu);
        this.initializeEvents();
    }
    public onLoad(): void {}

    public setOnZoomChange(onZoomChange: (zoom: number) => void): void {
        this.onZoomChange = onZoomChange;
    }

    private initializeEvents(): void {
        this.app.canvas.addEventListener('wheel', this.handleWheel);
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.app.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        if (event.code === 'Space') {
            event.preventDefault();
            this.isSpacePressed = true;
            this.app.canvas.style.cursor = 'grab';
        }
    };

    private handleKeyUp = (event: KeyboardEvent): void => {
        if (event.code === 'Space') {
            this.isSpacePressed = false;
            this.app.canvas.style.cursor = 'default';
        }
    };

    private handleMouseDown = (event: MouseEvent): void => {
        if (event.button === 2 && this.isSpacePressed) {
            event.preventDefault();
            this.isDragging = true;
            this.lastMousePosition = { x: event.clientX, y: event.clientY };
            this.app.canvas.style.cursor = 'grabbing';
        }
    };

    private handleMouseUp = (event: MouseEvent): void => {
        if (event.button === 2) {
            this.isDragging = false;
            this.app.canvas.style.cursor = this.isSpacePressed
                ? 'grab'
                : 'default';
        }
    };

    private handleMouseMove = (event: MouseEvent): void => {
        if (this.isDragging) {
            const deltaX = event.clientX - this.lastMousePosition.x;
            const deltaY = event.clientY - this.lastMousePosition.y;

            this.layers.mainZone.position.x += deltaX;
            this.layers.mainZone.position.y += deltaY;

            this.lastMousePosition = { x: event.clientX, y: event.clientY };
            this.emit(Events.CANVAS_TRANSLATE);
        }
    };

    private zoomContainer(event: WheelEvent, container: Container) {
        // 计算缩放增量
        const delta = -event.deltaY * 0.001;
        const newZoom = Math.min(
            Math.max(this.currentZoom + delta, this.minZoom),
            this.maxZoom
        );

        if (newZoom !== this.currentZoom) {
            // 获取鼠标在容器中的位置
            const bounds = this.app.canvas.getBoundingClientRect();
            const mouseX = event.clientX - bounds.left;
            const mouseY = event.clientY - bounds.top;

            // 将鼠标位置转换为容器的本地坐标
            const localPos = container.toLocal(
                { x: mouseX, y: mouseY },
                this.app.stage
            );

            // 存缩放前的位置
            const beforeTransform = {
                x: localPos.x * this.currentZoom,
                y: localPos.y * this.currentZoom,
            };

            // 应用新的缩放
            this.currentZoom = newZoom;
            container.scale.set(this.currentZoom);

            // 计算缩放后的位置
            const afterTransform = {
                x: localPos.x * this.currentZoom,
                y: localPos.y * this.currentZoom,
            };

            // 调整置以保持鼠标指向的点不变
            container.position.x += beforeTransform.x - afterTransform.x;
            container.position.y += beforeTransform.y - afterTransform.y;
        }
    }

    private handleWheel = (event: WheelEvent): void => {
        // 检查是否按住 Command (Mac) 或 Ctrl (Windows)
        if (!event.metaKey && !event.ctrlKey) return;

        event.preventDefault();

        this.zoomContainer(event, this.layers.mainZone);

        // 触发缩放变化回调
        this.onZoomChange?.(this.currentZoom);
    };

    public getCurrentZoom(): number {
        return this.currentZoom;
    }

    public setZoom(zoom: number): void {
        this.currentZoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
        this.layers.mainZone.scale.set(this.currentZoom);
        this.onZoomChange?.(this.currentZoom);
    }

    public destroy(): void {
        this.app.canvas.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.app.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        this.app.canvas.removeEventListener(
            'contextmenu',
            this.handleContextMenu
        );
    }

    private handleContextMenu = (event: MouseEvent): void => {
        event.preventDefault();
    };
}
