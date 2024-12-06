import { autobind } from 'core-decorators';
import {
    Application,
    Graphics,
    Sprite,
    Point,
    FederatedPointerEvent,
    Text,
    Container,
} from 'pixi.js';

import { AbstractPlugin } from './AbstractPlugin';
import { getAngle, changeAnchor } from '../utils/util';

const EDGE_COLOR = 0xffbb66;
const HANDLE_COLOR = 0xffbb66;
const ROTATE_HANDLE_COLOR = 0x00ffbb;

export class SelectionController extends AbstractPlugin {
    private selectedTarget: Sprite | Text | null = null;
    private controlBox: Container;
    private controlBoxGraphic: Graphics;
    private handles: Graphics[] = [];
    private dragStartPosition = new Point();
    private originalPosition = new Point();
    private isDraggingSprite = false;
    private isResizing = false;
    private activeHandle: Graphics | null = null;
    private rotateHandle: Graphics | null = null;
    private startSize = { width: 0, height: 0 };
    private isRotating = false;
    private startAngle = 0;
    private container: Container;

    public init(
        _app: Application,
        layers: { canvasZone: Container; topLayer: Container }
    ): void {
        this.container = layers.topLayer;
        this.initializeEvents();
        this.createControlBox();
        this.createTransformHandles();
        this.createRotateHandle();
    }
    public onLoad(): void {}

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
        } else if (target instanceof Text) {
            console.log('text', target);
            this.selectSprite(target);
        } else {
            // 点击空白处取消选择
            this.clearSelection();
        }
    }

    private selectSprite(sprite: Sprite | Text): void {
        this.clearSelection();
        this.selectedTarget = sprite;

        this.controlBox.visible = true;
        this.updateControlBoxSizeAndPos(sprite);

        // 为选中的精灵添加拖拽功能
        sprite.eventMode = 'static';
        sprite.cursor = 'move';
        sprite.on('pointerdown', this.onSpriteDragStart);
    }

    private updateControlBoxPos(sprite: Sprite | Text): Readonly<Point> {
        const spriteWorldPos = sprite.getGlobalPosition();
        const posInControlBox = this.controlBox.parent.toLocal(spriteWorldPos);
        this.controlBox.x = posInControlBox.x;
        this.controlBox.y = posInControlBox.y;
        this.controlBox.angle = sprite.angle;
        return this.controlBox.position;
    }

    private updateControlBoxSize(sprite: Sprite | Text): void {
        if (!this.controlBox) {
            return;
        }
        this.controlBoxGraphic.clear();
        const width = sprite.width;
        const height = sprite.height;
        this.controlBoxGraphic.rect(
            -width * sprite.anchor.x,
            -height * sprite.anchor.y,
            width,
            height
        );
        this.controlBoxGraphic.stroke({
            width: 2,
            color: EDGE_COLOR,
            alignment: 0.5,
        });
    }

    private updateControlBoxSizeAndPos(sprite: Sprite | Text): void {
        if (!this.controlBox || !this.handles.length) {
            return;
        }
        this.updateControlBoxPos(sprite);
        this.updateControlBoxSize(sprite);
        this.updateHandlesPos(sprite);
        this.updateRotateHandlePos(sprite);
    }

    private updateRotateHandlePos(sprite: Sprite | Text): void {
        if (!this.rotateHandle) {
            return;
        }
        const offsetY = 20;
        const bottom = sprite.height * (1 - sprite.anchor.y);
        this.rotateHandle.clear();
        const left = -sprite.width * sprite.anchor.x;
        const right = sprite.width * (1 - sprite.anchor.x);
        const mid = (left + right) / 2;
        this.rotateHandle.moveTo(mid, bottom);
        this.rotateHandle.lineTo(mid, bottom + offsetY);
        this.rotateHandle.stroke({
            width: 2,
            color: ROTATE_HANDLE_COLOR,
        });

        this.rotateHandle.circle(mid, bottom + offsetY, 5);
        this.rotateHandle.fill(ROTATE_HANDLE_COLOR);
    }

    private updateHandlesPos(sprite: Sprite | Text): void {
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
        const midX = (leftTop.x + rightTop.x) / 2;
        const midY = (leftTop.y + leftBottom.y) / 2;
        const topMid = {
            x: midX,
            y: leftTop.y,
        };
        const bottomMid = {
            x: midX,
            y: leftBottom.y,
        };

        const leftMid = {
            x: leftTop.x,
            y: midY,
        };
        const rightMid = {
            x: rightTop.x,
            y: midY,
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
        this.controlBox = new Container();
        this.controlBoxGraphic = new Graphics();
        this.controlBox.addChild(this.controlBoxGraphic);
        this.container.addChild(this.controlBox);
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

        positions.forEach((_pos, index) => {
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
        if (!this.selectedTarget) return;

        event.stopPropagation();
        this.isRotating = true;

        // 计算初始角度
        this.dragStartPosition = this.container.toLocal(event.global);
        this.startAngle = this.selectedTarget.angle;
        changeAnchor(this.selectedTarget, {
            x: 0.5,
            y: 0.5,
        });
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
        this.dragStartPosition = this.container.toLocal(event.global);
        this.originalPosition.x = this.selectedTarget!.x;
        this.originalPosition.y = this.selectedTarget!.y;
        this.app.stage.on('pointermove', this.onPointerMove);
        this.app.stage.on('pointerup', this.onPointerUp);
    }

    @autobind
    private resizeSprite(
        handleIndex: number,
        deltaX: number,
        deltaY: number
    ): void {
        if (!this.selectedTarget) return;

        // 获取精灵的全局变换信息
        const sprite = this.selectedTarget;
        const angle = sprite.angle * (Math.PI / 180); // 转换为弧度

        // 将鼠标移动的距离转换到精灵的本地坐标系
        const cos = Math.cos(-angle);
        const sin = Math.sin(-angle);
        let localDeltaX = deltaX * cos - deltaY * sin;
        let localDeltaY = deltaX * sin + deltaY * cos;

        switch (handleIndex) {
            case 0: // 左上
                localDeltaX = -localDeltaX;
                localDeltaY = -localDeltaY;
                break;
            case 2: // 右上
                localDeltaY = -localDeltaY;
                break;
            case 4: // 右下
                break;
            case 6: // 左下
                localDeltaX = -localDeltaX;
                break;
            case 1: // 上中
                localDeltaX = 0;
                localDeltaY = -localDeltaY;
                break;
            case 3: // 右中
                localDeltaY = 0;
                break;
            case 5: // 下中
                localDeltaX = 0;
                break;
            case 7: // 左中
                localDeltaY = 0;
                localDeltaX = -localDeltaX;
                break;
        }

        // 计算新的尺寸
        const newWidth = localDeltaX + this.startSize.width;
        const newHeight = localDeltaY + this.startSize.height;

        // 应用最小尺寸限制
        this.selectedTarget.width = Math.max(50, newWidth);
        this.selectedTarget.height = Math.max(50, newHeight);

        // 更新控制框
        this.updateControlBoxSizeAndPos(sprite);
    }

    public updateSelf() {
        if (!this.selectedTarget) return;
        this.updateControlBoxSizeAndPos(this.selectedTarget);
    }

    @autobind
    private onHandleDragStart(
        event: FederatedPointerEvent,
        handleIndex: number
    ): void {
        event.stopPropagation();

        if (!this.selectedTarget) return;

        this.isResizing = true;
        this.activeHandle = this.handles[handleIndex];

        this.dragStartPosition = this.container.toLocal(event.global);
        // console.log('dragStartPosition', this.dragStartPosition);
        let anchorData = {
            x: 0.5,
            y: 0.5,
        };
        switch (handleIndex) {
            case 0: // 左上
                anchorData.x = 1;
                anchorData.y = 1;
                break;
            case 2: // 右上
                anchorData.x = 0;
                anchorData.y = 1;
                break;
            case 4: // 右下
                anchorData.x = 0;
                anchorData.y = 0;
                break;
            case 6: // 左下
                anchorData.x = 1;
                anchorData.y = 0;
                break;
            case 1: // 上中
                anchorData.y = 1;
                break;
            case 3: // 右中
                anchorData.x = 0;
                break;
            case 5: // 下中
                anchorData.y = 0;
                break;
            case 7: // 左中
                anchorData.x = 1;
                break;
        }

        changeAnchor(this.selectedTarget, anchorData);

        // 保存初始状态
        this.startSize = this.selectedTarget.getSize();
        this.app.stage.on('pointermove', this.onPointerMove);
        this.app.stage.on('pointerup', this.onPointerUp);
    }

    @autobind
    private onPointerMove(event: FederatedPointerEvent): void {
        if (!this.selectedTarget) return;

        const newPosition = this.container.toLocal(event.global);
        if (this.isDraggingSprite) {
            const deltaX = newPosition.x - this.dragStartPosition.x;
            const deltaY = newPosition.y - this.dragStartPosition.y;

            this.selectedTarget.x = this.originalPosition.x + deltaX;
            this.selectedTarget.y = this.originalPosition.y + deltaY;
            this.updateControlBoxPos(this.selectedTarget);
        } else if (this.isResizing && this.activeHandle) {
            const deltaX = newPosition.x - this.dragStartPosition.x;
            const deltaY = newPosition.y - this.dragStartPosition.y;

            const handleIndex = this.handles.indexOf(this.activeHandle);
            this.resizeSprite(handleIndex, deltaX, deltaY);
        } else if (this.isRotating) {
            const center = this.selectedTarget.position;

            // 计算当前角度

            const startVec = this.dragStartPosition.subtract(center);
            const currentVec = newPosition.subtract(center);

            // 计算角度差
            let deltaRotation = getAngle(startVec, currentVec);

            // 设置新的角度
            let newAngle = this.startAngle + deltaRotation;

            // 可选：将角度限制在 0-360 度范围内
            newAngle = ((newAngle % 360) + 360) % 360;

            this.selectedTarget.angle = newAngle;
            this.updateControlBoxSizeAndPos(this.selectedTarget);
        }
    }

    @autobind
    private onPointerUp(): void {
        if (!this.selectedTarget) return;
        this.isDraggingSprite = false;
        if (this.isResizing) {
            changeAnchor(this.selectedTarget, {
                x: 0.5,
                y: 0.5,
            });
        }
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
        if (this.selectedTarget) {
            // 移除拖拽事件
            this.selectedTarget.off('pointerdown');
            if (this.controlBox) {
                this.selectedTarget.removeChild(this.controlBox);
            }

            this.handles.forEach(handle => {
                this.selectedTarget!.removeChild(handle);
            });

            this.selectedTarget = null;
        }
    }

    // 获取当前选中的精灵
    public getSelectedSprite(): Sprite | Text | null {
        return this.selectedTarget;
    }

    // 设置选中精灵的大小
    public resizeSelectedSprite(width: number, height: number): void {
        if (this.selectedTarget) {
            this.selectedTarget.width = width;
            this.selectedTarget.height = height;
            // this.clearSelection();
            // this.selectSprite(this.selectedSprite);
        }
    }

    // 旋转选中的精灵
    public rotateSelectedSprite(angle: number): void {
        if (this.selectedTarget) {
            this.selectedTarget.angle = angle;
            // this.clearSelection();
            this.selectSprite(this.selectedTarget);
        }
    }
}
