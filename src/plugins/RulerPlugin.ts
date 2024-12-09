import { Application, Container, Graphics, Point, Text } from 'pixi.js';
import { AbstractPlugin } from './AbstractPlugin';
import { RULER_THICKNESS } from '../consts';

export interface RulerOptions {
    unit: number; // 每个小刻度的单位长度（像素）
    majorUnit: number; // 每个大刻度包含几个小刻度
    color: number; // 标尺颜色
    thickness: number; // 标尺厚度
}

export class Ruler extends AbstractPlugin {
    private options: RulerOptions;
    private horizontalTextContainer: Container;
    private verticalTextContainer: Container;
    private graphics: Graphics;
    private measureContainer: Container;
    public container: Container;
    public init(): void {
        this.options = {
            unit: 10, // 10px为一个小刻度
            majorUnit: 5, // 每5个小刻度显示一个大刻度
            color: 0x333333, // 深灰色
            thickness: RULER_THICKNESS, // 标尺厚度
        };

        this.horizontalTextContainer = new Container();
        this.verticalTextContainer = new Container();
        this.graphics = new Graphics();
        this.container = new Container();
        const canvasZone = this.layers.canvasZone;
        this.measureContainer = canvasZone;
        this.container.addChild(this.graphics);
        this.container.addChild(this.horizontalTextContainer);
        this.container.addChild(this.verticalTextContainer);

        this.app.stage.addChild(this.container);
    }
    public onLoad(): void {
        this.draw();
    }

    public setOptions(options: Partial<RulerOptions>): void {
        this.options = { ...this.options, ...options };
        this.draw();
    }

    private draw() {
        this.graphics.clear();
        const thickness = this.options.thickness;
        const width = this.app.screen.width - this.options.thickness;
        const height = this.app.screen.height - this.options.thickness;
        // 绘制水平标尺背景
        this.graphics.rect(thickness, 0, width, thickness);

        // 绘制垂直标尺背景
        this.graphics.rect(0, thickness, thickness, height);

        // 绘制左上角方块
        // this.graphics.rect(
        //     0,
        //     0,
        //     this.options.thickness,
        //     this.options.thickness
        // );
        this.graphics.stroke({
            color: this.options.color,
            width: 1,
            alignment: 1,
        });

        // 绘制水平刻度
        this.drawHorizontalMarks();

        // 绘制垂直刻度
        this.drawVerticalMarks();
    }

    private drawHorizontalMarks() {
        const { unit, color } = this.options;

        let count = 0;
        for (let x = 0; ; x += unit) {
            if (this.drawHorizontalMark(x, count)) {
                ++count;
            } else {
                break;
            }
        }
        count = 0;
        for (let x = 0; ; x -= unit) {
            if (this.drawHorizontalMark(x, count)) {
                ++count;
            } else {
                break;
            }
        }
        this.graphics.stroke({
            color: color,
            width: 1,
        });
    }

    private drawVerticalMark(y: number, count: number): boolean {
        const { thickness, color } = this.options;

        const globalPos = this.measureContainer.toGlobal(new Point(0, y));
        const isMajor = count % 10 === 0;
        ++count;

        const markWidth = isMajor ? thickness / 2 : thickness / 3;
        const posInGraphics = this.graphics.toLocal(globalPos);
        const yNumber = posInGraphics.y;
        if (globalPos.y < thickness || globalPos.y > this.app.screen.height) {
            return false;
        }

        this.graphics.moveTo(thickness, yNumber);
        this.graphics.lineTo(thickness - markWidth, yNumber);

        if (isMajor) {
            const text = new Text({
                text: Math.round(y).toString(),
                style: {
                    fontSize: 10,
                    fill: color,
                },
            });
            text.position.set(2, yNumber - text.height / 2);
            this.verticalTextContainer.addChild(text);
        }
        return true;
    }

    private drawHorizontalMark(x: number, count: number): boolean {
        const { thickness, color } = this.options;

        const globalPos = this.measureContainer.toGlobal(new Point(x, 0));
        const isMajor = count % 10 === 0;
        ++count;

        const markWidth = isMajor ? thickness / 2 : thickness / 3;
        const posInGraphics = this.graphics.toLocal(globalPos);
        const xNumber = posInGraphics.x;
        if (globalPos.x < thickness || globalPos.x > this.app.screen.width) {
            return false;
        }

        this.graphics.moveTo(xNumber, thickness);
        this.graphics.lineTo(xNumber, thickness - markWidth);

        if (isMajor) {
            const text = new Text({
                text: Math.round(x).toString(),
                style: {
                    fontSize: 10,
                    fill: color,
                },
            });
            text.position.set(xNumber - text.height / 2, 2);
            this.verticalTextContainer.addChild(text);
        }
        return true;
    }

    private drawVerticalMarks() {
        const { unit, color } = this.options;

        let count = 0;
        for (let y = 0; ; y += unit) {
            if (this.drawVerticalMark(y, count)) {
                ++count;
            } else {
                break;
            }
        }
        count = 0;
        for (let y = 0; ; y -= unit) {
            if (this.drawVerticalMark(y, count)) {
                ++count;
            } else {
                break;
            }
        }
        this.graphics.stroke({
            color: color,
            width: 1,
        });
    }

    // 更新标尺尺寸

    // 设置标尺单位
    public setUnit(unit: number, majorUnit?: number) {
        this.options.unit = unit;
        if (majorUnit) {
            this.options.majorUnit = majorUnit;
        }
        this.horizontalTextContainer.removeChildren();
        this.verticalTextContainer.removeChildren();
        this.draw();
    }

    // 新增：设置缩放的方法
    public setZoom(zoom: number) {
        // 根据缩放调整单位
        const baseUnit = 10; // 基础单位为10像素
        const adjustedUnit = baseUnit * (1 / zoom);

        // 调整主要刻度的间隔
        let majorUnit = 5;
        if (zoom < 0.5) {
            majorUnit = 10;
        } else if (zoom > 2) {
            majorUnit = 2;
        }

        // 更新标尺
        this.setUnit(adjustedUnit, majorUnit);
    }
}
