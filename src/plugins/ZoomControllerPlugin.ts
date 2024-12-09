import { Container } from 'pixi.js';
import { AbstractPlugin } from './AbstractPlugin';

export class ZoomControllerPlugin extends AbstractPlugin {
    private minZoom = 0.1;
    private maxZoom = 5;
    private currentZoom = 1;
    private onZoomChange?: (zoom: number) => void;

    public init(): void {
        this.currentZoom = this.layers.mainZone.scale.x;
        this.initializeEvents();
    }
    public onLoad(): void {}

    public setOnZoomChange(onZoomChange: (zoom: number) => void): void {
        this.onZoomChange = onZoomChange;
    }

    private initializeEvents(): void {
        this.app.canvas.addEventListener('wheel', this.handleWheel);
    }

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

            // 保存缩放前的位置
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

            // 调整位置以保持鼠标指向的点不变
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
    }
}
