import { autobind } from 'core-decorators';
import {
    Application,
    Graphics,
    Sprite,
    Point,
    FederatedPointerEvent,
} from 'pixi.js';

export class SelectionController {
    private app: Application;
    private selectedSprite: Sprite | null = null;
    private controlBox: Graphics | null = null;
    private handles: Graphics[] = [];
    private isDragging = false;
    private dragStartPosition = new Point();
    private originalPosition = new Point();
    private isDraggingSprite = false;
    private isResizing = false;
    private activeHandle: Graphics | null = null;
    private startPosition = new Point();
    private startSize = { width: 0, height: 0 };
    private resizeStartPoint = new Point();

    constructor(app: Application) {
        this.app = app;
        this.initializeEvents();
        this.createControlBox();
        this.createTransformHandles();
    }

    private initializeEvents(): void {
        // this.app.stage.eventMode = 'dynamic';
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointerdown', this.onStageClick);

        // 添加全局事件监听
    }

    @autobind
    private onStageClick(event: FederatedPointerEvent): void {
        console.log('onStageClick', event);
        const target = event.target;

        // 如果点击的是精灵
        if (target instanceof Sprite) {
            this.selectSprite(target);
        } else {
            // 点击空白处取消选择
            this.clearSelection();
        }
    }

    private selectSprite(sprite: Sprite): void {
        if (!this.controlBox) {
            return;
        }
        this.clearSelection();
        this.selectedSprite = sprite;

        this.controlBox.visible = true;
        this.updateControlBoxSizeAndPos(sprite);

        // 为选中的精灵添加拖拽功能
        sprite.eventMode = 'static';
        sprite.cursor = 'move';
        sprite.on('pointerdown', this.onSpriteDragStart);
    }

    private updateControlBoxPos(sprite: Sprite): void {
        if (!this.controlBox) {
            return;
        }
        const spriteWorldPos = sprite.getGlobalPosition();
        const posInControlBox = this.controlBox.parent.toLocal(spriteWorldPos);
        this.controlBox.x = posInControlBox.x;
        this.controlBox.y = posInControlBox.y;
    }

    private updateControlBoxSize(sprite: Sprite): void {
        if (!this.controlBox) {
            return;
        }
        this.controlBox.clear();
        const width = sprite.width;
        const height = sprite.height;
        this.controlBox.rect(
            -width * sprite.anchor.x,
            -height * sprite.anchor.y,
            width,
            height
        );
        this.controlBox.stroke({
            width: 2,
            color: 0x00ff00,
        });
    }

    private updateControlBoxSizeAndPos(sprite: Sprite): void {
        if (!this.controlBox || !this.handles.length) {
            return;
        }
        this.updateControlBoxSize(sprite);
        this.updateControlBoxPos(sprite);
        this.updateHandlesPos(sprite);
    }

    private updateHandlesPos(sprite: Sprite): void {
        if (!this.handles.length || !this.controlBox) {
            return;
        }
        const width = sprite.width;
        const height = sprite.height;
        const leftTop = {
            x: -width * sprite.anchor.x,
            y: -height * sprite.anchor.y,
        };
        const leftBottom = {
            x: -width * sprite.anchor.x,
            y: height * sprite.anchor.y,
        };
        const rightTop = {
            x: width * sprite.anchor.x,
            y: -height * sprite.anchor.y,
        };
        const rightBottom = {
            x: width * sprite.anchor.x,
            y: height * sprite.anchor.y,
        };
        // { x: 0, y: 0 }, // 左上
        // { x: 0.5, y: 0 }, // 上中
        // { x: 1, y: 0 }, // 右上
        // { x: 1, y: 0.5 }, // 右中
        // { x: 1, y: 1 }, // 右下
        // { x: 0.5, y: 1 }, // 下中
        // { x: 0, y: 1 }, // 左下
        // { x: 0, y: 0.5 }, // 左中

        this.handles.forEach((handle, index) => {
            handle.clear();
            if (index === 0) {
                handle.circle(leftTop.x, leftTop.y, 5);
                handle.fill(0xffbb66);
            } else if (index === 1) {
                handle.circle(rightTop.x, rightTop.y, 5);
                handle.fill(0xffbb66);
            } else if (index === 2) {
                handle.circle(rightBottom.x, rightBottom.y, 5);
                handle.fill(0xffbb66);
            } else if (index === 3) {
                handle.circle(leftBottom.x, leftBottom.y, 5);
                handle.fill(0xffbb66);
            }
            handle.visible = true;
        });
    }

    private createControlBox(): void {
        this.controlBox = new Graphics();
        this.app.stage.addChild(this.controlBox);
    }

    private createTransformHandles(): void {
        // 创建8个控制点
        const positions = [
            { x: 0, y: 0 }, // 左上
            // { x: 0.5, y: 0 }, // 上中
            { x: 1, y: 0 }, // 右上
            // { x: 1, y: 0.5 }, // 右中
            { x: 1, y: 1 }, // 右下
            // { x: 0.5, y: 1 }, // 下中
            { x: 0, y: 1 }, // 左下
            // { x: 0, y: 0.5 }, // 左中
        ];

        positions.forEach((pos, index) => {
            const handle = new Graphics();
            handle.eventMode = 'static';
            handle.cursor = this.getHandleCursor(index);

            handle.visible = false;

            // 简化事件监听，只需要处理 pointerdown
            handle.on('pointerdown', event => {
                this.onHandleDragStart(event, index);
            });

            this.handles.push(handle);
            this.controlBox!.addChild(handle);
        });
    }

    private getHandleCursor(index: number): string {
        const cursors = [
            'nw-resize',
            'n-resize',
            'ne-resize',
            'e-resize',
            'se-resize',
            's-resize',
            'sw-resize',
            'w-resize',
        ];
        return cursors[index];
    }

    @autobind
    private onSpriteDragStart(event: FederatedPointerEvent): void {
        this.isDraggingSprite = true;
        this.startPosition.copyFrom(event.global);
        this.originalPosition.x = this.selectedSprite!.x;
        this.originalPosition.y = this.selectedSprite!.y;
        this.app.stage.on('pointermove', this.onPointerMove);
        this.app.stage.on('pointerup', this.onPointerUp);
    }

    private onHandleDragStart(
        event: FederatedPointerEvent,
        handleIndex: number
    ): void {
        event.stopPropagation();
        this.isResizing = true;
        this.activeHandle = this.handles[handleIndex];
        this.resizeStartPoint.copyFrom(event.global);
        if (this.selectedSprite) {
            this.startSize = {
                width: this.selectedSprite.width,
                height: this.selectedSprite.height,
            };
        }
        this.app.stage.on('pointermove', this.onPointerMove);
        this.app.stage.on('pointerup', this.onPointerUp);
    }

    @autobind
    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.selectedSprite) return;

        if (this.isDraggingSprite) {
            const newPosition = event.global;
            const deltaX = newPosition.x - this.startPosition.x;
            const deltaY = newPosition.y - this.startPosition.y;

            this.selectedSprite.x = this.originalPosition.x + deltaX;
            this.selectedSprite.y = this.originalPosition.y + deltaY;
            this.updateControlBoxPos(this.selectedSprite);
        }

        if (this.isResizing && this.activeHandle) {
            const newPosition = event.global;
            const deltaX = newPosition.x - this.resizeStartPoint.x;
            const deltaY = newPosition.y - this.resizeStartPoint.y;

            const handleIndex = this.handles.indexOf(this.activeHandle);
            this.resizeSprite(handleIndex, deltaX, deltaY);
        }
    }

    private resizeSprite(
        handleIndex: number,
        deltaX: number,
        deltaY: number
    ): void {
        if (!this.selectedSprite) return;

        let newWidth = this.startSize.width;
        let newHeight = this.startSize.height;

        switch (handleIndex) {
            case 0: // 左上
                newWidth = this.startSize.width - deltaX;
                newHeight = this.startSize.height - deltaY;
                break;
            case 2: // 右上
                newWidth = this.startSize.width + deltaX;
                newHeight = this.startSize.height - deltaY;
                break;
            case 4: // 右下
                newWidth = this.startSize.width + deltaX;
                newHeight = this.startSize.height + deltaY;
                break;
            case 6: // 左下
                newWidth = this.startSize.width - deltaX;
                newHeight = this.startSize.height + deltaY;
                break;
            case 1: // 上中
                newHeight = this.startSize.height - deltaY;
                break;
            case 3: // 右中
                newWidth = this.startSize.width + deltaX;
                break;
            case 5: // 下中
                newHeight = this.startSize.height + deltaY;
                break;
            case 7: // 左中
                newWidth = this.startSize.width - deltaX;
                break;
        }

        // 确保尺寸不会太小
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);

        this.resizeSelectedSprite(newWidth, newHeight);
    }

    @autobind
    private onPointerUp(): void {
        this.isDraggingSprite = false;
        this.isResizing = false;
        this.activeHandle = null;
        this.app.stage.off('pointermove', this.onPointerMove);
        this.app.stage.off('pointerup', this.onPointerUp);
    }

    private clearSelection(): void {
        if (!this.controlBox) {
            return;
        }
        this.controlBox.visible = false;
        if (this.selectedSprite) {
            // 移除拖拽事件
            this.selectedSprite.off('pointerdown');
            if (this.controlBox) {
                this.selectedSprite.removeChild(this.controlBox);
            }

            this.handles.forEach(handle => {
                this.selectedSprite!.removeChild(handle);
            });

            this.selectedSprite = null;
        }
    }

    // 获取当前选中的精灵
    public getSelectedSprite(): Sprite | null {
        return this.selectedSprite;
    }

    // 设置选中精灵的大小
    public resizeSelectedSprite(width: number, height: number): void {
        if (this.selectedSprite) {
            this.selectedSprite.width = width;
            this.selectedSprite.height = height;
            // this.clearSelection();
            // this.selectSprite(this.selectedSprite);
        }
    }

    // 旋转选中的精灵
    public rotateSelectedSprite(angle: number): void {
        if (this.selectedSprite) {
            this.selectedSprite.angle = angle;
            // this.clearSelection();
            this.selectSprite(this.selectedSprite);
        }
    }
}
