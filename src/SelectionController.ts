import { autobind } from 'core-decorators';
import {
    Application,
    Graphics,
    Sprite,
    Point,
    FederatedPointerEvent,
} from 'pixi.js';

const EDGE_COLOR = 0xffbb66;
const HANDLE_COLOR = 0xffbb66;
const ROTATE_HANDLE_COLOR = 0x00ffbb;

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
    private rotateHandle: Graphics | null = null;
    private startPosition = new Point();
    private startSize = { width: 0, height: 0 };
    private resizeStartPoint = new Point();
    private isRotating = false;
    private startRotation = 0;
    private startAngle = 0;

    constructor(app: Application) {
        this.app = app;
        this.initializeEvents();
        this.createControlBox();
        this.createTransformHandles();
        this.createRotateHandle();
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

    private updateControlBoxPos(sprite: Sprite): Readonly<Point> {
        if (!this.controlBox) {
            return new Point();
        }
        const spriteWorldPos = sprite.getGlobalPosition();
        const posInControlBox = this.controlBox.parent.toLocal(spriteWorldPos);
        this.controlBox.x = posInControlBox.x;
        this.controlBox.y = posInControlBox.y;
        this.controlBox.angle = sprite.angle;
        return this.controlBox.position;
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
            color: EDGE_COLOR,
            alignment: 0.5,
        });
    }

    private updateControlBoxSizeAndPos(sprite: Sprite): void {
        if (!this.controlBox || !this.handles.length) {
            return;
        }
        this.updateControlBoxPos(sprite);
        this.updateControlBoxSize(sprite);
        this.updateHandlesPos(sprite);
        this.updateRotateHandlePos(sprite);
    }

    private updateRotateHandlePos(sprite: Sprite): void {
        if (!this.rotateHandle) {
            return;
        }
        const offsetY = Math.max(sprite.height * 0.2, 20);
        const bottom = sprite.height * (1 - sprite.anchor.y);
        this.rotateHandle.clear();
        this.rotateHandle.moveTo(0, bottom);
        this.rotateHandle.lineTo(0, bottom + offsetY);
        this.rotateHandle.stroke({
            width: 2,
            color: ROTATE_HANDLE_COLOR,
        });

        this.rotateHandle.circle(0, bottom + offsetY, 5);
        this.rotateHandle.fill(ROTATE_HANDLE_COLOR);
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
            y: height * (1 - sprite.anchor.y),
        };
        const rightTop = {
            x: width * (1 - sprite.anchor.x),
            y: -height * sprite.anchor.y,
        };
        const rightBottom = {
            x: width * (1 - sprite.anchor.x),
            y: height * (1 - sprite.anchor.y),
        };

        const topMid = {
            x: 0,
            y: leftTop.y,
        };
        const bottomMid = {
            x: 0,
            y: leftBottom.y,
        };

        const leftMid = {
            x: leftTop.x,
            y: 0,
        };
        const rightMid = {
            x: rightTop.x,
            y: 0,
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
                handle.position.set(leftTop.x, leftTop.y);
            } else if (index === 1) {
                handle.position.set(topMid.x, topMid.y);
            } else if (index === 2) {
                handle.position.set(rightTop.x, rightTop.y);
            } else if (index === 3) {
                handle.position.set(rightMid.x, rightMid.y);
            } else if (index === 4) {
                handle.position.set(rightBottom.x, rightBottom.y);
            } else if (index === 5) {
                handle.position.set(bottomMid.x, bottomMid.y);
            } else if (index === 6) {
                handle.position.set(leftBottom.x, leftBottom.y);
            } else if (index === 7) {
                handle.position.set(leftMid.x, leftMid.y);
            }
            handle.visible = true;
            handle.circle(0, 0, 5);
            handle.fill(HANDLE_COLOR);
        });
    }

    private createControlBox(): void {
        this.controlBox = new Graphics();
        this.app.stage.addChild(this.controlBox);
    }

    private createRotateHandle(): void {
        if (!this.controlBox) {
            return;
        }
        this.rotateHandle = new Graphics();
        this.rotateHandle.eventMode = 'static';
        this.rotateHandle.cursor = 'grab';
        this.rotateHandle.on('pointerdown', this.onRotateHandleDragStart);
        this.controlBox.addChild(this.rotateHandle);
    }

    private createTransformHandles(): void {
        // 创建8个控制点
        const positions = [
            { x: 0, y: 0 }, // 左上
            { x: 0.5, y: 0 }, // 上中
            { x: 1, y: 0 }, // 右上
            { x: 1, y: 0.5 }, // 右中
            { x: 1, y: 1 }, // 右下
            { x: 0.5, y: 1 }, // 下中
            { x: 0, y: 1 }, // 左下
            { x: 0, y: 0.5 }, // 左中
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
    @autobind
    private onRotateHandleDragStart(event: FederatedPointerEvent): void {
        if (!this.selectedSprite) return;

        event.stopPropagation();
        this.isRotating = true;

        // 计算初始角度
        const center = this.getSpriteCenterGlobal();
        const startPos = event.global;
        this.startRotation =
            (Math.atan2(startPos.y - center.y, startPos.x - center.x) * 180) /
            Math.PI;
        this.startAngle = this.selectedSprite.angle;

        // 添加事件监听
        this.app.stage.on('pointermove', this.onPointerMove);
        this.app.stage.on('pointerup', this.onPointerUp);
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
        } else if (this.isResizing && this.activeHandle) {
            const newPosition = event.global;
            const deltaX = newPosition.x - this.resizeStartPoint.x;
            const deltaY = newPosition.y - this.resizeStartPoint.y;

            const handleIndex = this.handles.indexOf(this.activeHandle);
            this.resizeSprite(handleIndex, deltaX, deltaY);
        } else if (this.isRotating) {
            const center = this.getSpriteCenterGlobal();
            const currentPos = event.global;

            // 计算当前角度
            const currentRotation =
                (Math.atan2(currentPos.y - center.y, currentPos.x - center.x) *
                    180) /
                Math.PI;

            // 计算角度差
            let deltaRotation = currentRotation - this.startRotation;

            // 设置新的角度
            let newAngle = this.startAngle + deltaRotation;

            // 可选：将角度限制在 0-360 度范围内
            newAngle = ((newAngle % 360) + 360) % 360;

            this.selectedSprite.angle = newAngle;
            this.updateControlBoxSizeAndPos(this.selectedSprite);
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
        this.isRotating = false;
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

    // 辅助方法：获取精灵中心点的全局坐标
    private getSpriteCenterGlobal(): Point {
        if (!this.selectedSprite) return new Point();

        const bounds = this.selectedSprite.getBounds();
        return new Point(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2
        );
    }
}
