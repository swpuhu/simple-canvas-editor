import { Container, Graphics, Point, Text } from 'pixi.js';

export interface RulerOptions {
    width: number;
    height: number;
    unit: number; // 每个小刻度的单位长度（像素）
    majorUnit: number; // 每个大刻度包含几个小刻度
    color: number; // 标尺颜色
    thickness: number; // 标尺厚度
    measureContainer?: Container; // 测量容器
}

export class Ruler extends Container {
    private options: RulerOptions;
    private horizontalRuler: Container;
    private verticalRuler: Container;
    private graphics: Graphics;
    private currentZoom: number = 1; // 新增：当前缩放值

    constructor(options: Partial<RulerOptions> = {}) {
        super();

        // 默认配置
        this.options = {
            width: 800,
            height: 600,
            unit: 10, // 10px为一个小刻度
            majorUnit: 5, // 每5个小刻度显示一个大刻度
            color: 0x333333, // 深灰色
            thickness: 20, // 标尺厚度
            ...options,
        };

        this.horizontalRuler = new Container();
        this.verticalRuler = new Container();
        this.graphics = new Graphics();

        this.addChild(this.graphics);
        this.addChild(this.horizontalRuler);
        this.addChild(this.verticalRuler);

        this.draw();
    }

    private draw() {
        this.graphics.clear();

        // 绘制水平标尺背景
        this.graphics.rect(
            this.options.thickness,
            0,
            this.options.width,
            this.options.thickness
        );

        // 绘制垂直标尺背景
        this.graphics.rect(
            0,
            this.options.thickness,
            this.options.thickness,
            this.options.height
        );

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
        const { unit, majorUnit, thickness, width, color } = this.options;

        for (let x = thickness; x <= width; x += unit) {
            const isMajor = Math.round(x / unit) % majorUnit === 0;
            const markHeight = isMajor ? thickness / 2 : thickness / 3;

            this.graphics.moveTo(x, thickness);
            this.graphics.lineTo(x, thickness - markHeight);
            let xNumber = x;
            if (this.options.measureContainer) {
                const p = new Point(x, 0);
                const worldP = this.graphics.toGlobal(p);
                const pInMeasureContainer =
                    this.options.measureContainer.toLocal(worldP);
                xNumber = pInMeasureContainer.x;
            }

            // 在大刻度处添加数字
            if (isMajor) {
                const text = new Text({
                    text: Math.round(xNumber).toString(),
                    style: {
                        fontSize: 10,
                        fill: color,
                    },
                });
                text.position.set(x - text.width / 2, 2);
                this.horizontalRuler.addChild(text);
            }
        }
        this.graphics.stroke({
            color: color,
            width: 1,
        });
    }

    private drawVerticalMarks() {
        const { unit, majorUnit, thickness, height, color } = this.options;

        for (let y = thickness; y <= height; y += unit) {
            const isMajor = Math.round(y / unit) % majorUnit === 0;
            const markWidth = isMajor ? thickness / 2 : thickness / 3;

            this.graphics.moveTo(thickness, y);
            this.graphics.lineTo(thickness - markWidth, y);

            let yNumber = y;
            if (this.options.measureContainer) {
                const p = new Point(0, y);
                const worldP = this.graphics.toGlobal(p);
                const pInMeasureContainer =
                    this.options.measureContainer.toLocal(worldP);
                yNumber = pInMeasureContainer.y;
            }

            if (isMajor) {
                const text = new Text({
                    text: Math.round(yNumber).toString(),
                    style: {
                        fontSize: 10,
                        fill: color,
                    },
                });
                text.position.set(2, y - text.height / 2);
                this.verticalRuler.addChild(text);
            }
        }
        this.graphics.stroke({
            color: color,
            width: 1,
        });
    }

    // 更新标尺尺寸
    public resize(width: number, height: number) {
        this.options.width = width;
        this.options.height = height;
        this.horizontalRuler.removeChildren();
        this.verticalRuler.removeChildren();
        this.draw();
    }

    // 设置标尺单位
    public setUnit(unit: number, majorUnit?: number) {
        this.options.unit = unit;
        if (majorUnit) {
            this.options.majorUnit = majorUnit;
        }
        this.horizontalRuler.removeChildren();
        this.verticalRuler.removeChildren();
        this.draw();
    }

    // 新增：设置缩放的方法
    public setZoom(zoom: number) {
        this.currentZoom = zoom;
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
