import { Application, Container } from 'pixi.js';

export class ZoomController {
    private app: Application;
    private container: Container;
    private minZoom = 0.1;
    private maxZoom = 5;
    private currentZoom = 1;
    private onZoomChange?: (zoom: number) => void;

    constructor(
        app: Application,
        container: Container,
        onZoomChange?: (zoom: number) => void
    ) {
        this.app = app;
        this.container = container;
        this.onZoomChange = onZoomChange;
        this.initializeEvents();
    }

    private initializeEvents(): void {
        this.app.view.addEventListener('wheel', this.handleWheel);
    }

    private handleWheel = (event: WheelEvent): void => {
        // 检查是否按住 Command (Mac) 或 Ctrl (Windows)
        if (!event.metaKey && !event.ctrlKey) return;

        event.preventDefault();

        // 计算缩放增量
        const delta = -event.deltaY * 0.001;
        const newZoom = Math.min(
            Math.max(this.currentZoom + delta, this.minZoom),
            this.maxZoom
        );

        if (newZoom !== this.currentZoom) {
            // 获取鼠标在容器中的位置
            const bounds = this.app.view.getBoundingClientRect();
            const mouseX = event.clientX - bounds.left;
            const mouseY = event.clientY - bounds.top;

            // 将鼠标位置转换为容器的本地坐标
            const localPos = this.container.toLocal(
                { x: mouseX, y: mouseY },
                this.app.stage
            );

            // 保存缩放前的位置
            const beforeTransform = {
                x: localPos.x * this.currentZoom,
                y: localPos.y * this.currentZoom,
            };

            // 应用新的缩放
            this.currentZoom = newZoom;
            this.container.scale.set(this.currentZoom);

            // 计算缩放后的位置
            const afterTransform = {
                x: localPos.x * this.currentZoom,
                y: localPos.y * this.currentZoom,
            };

            // 调整位置以保持鼠标指向的点不变
            this.container.position.x += beforeTransform.x - afterTransform.x;
            this.container.position.y += beforeTransform.y - afterTransform.y;

            // 触发缩放变化回调
            this.onZoomChange?.(this.currentZoom);
        }
    };

    public getCurrentZoom(): number {
        return this.currentZoom;
    }

    public setZoom(zoom: number): void {
        this.currentZoom = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
        this.container.scale.set(this.currentZoom);
        this.onZoomChange?.(this.currentZoom);
    }

    public destroy(): void {
        this.app.view.removeEventListener('wheel', this.handleWheel);
    }
}
