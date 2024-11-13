import { Container, Graphics, Text } from 'pixi.js';

export interface RulerOptions {
    width: number;
    height: number;
    unit: number; // 每个小刻度的单位长度（像素）
    majorUnit: number; // 每个大刻度包含几个小刻度
    color: number; // 标尺颜色
    thickness: number; // 标尺厚度
}

export class Ruler extends Container {
    private options: RulerOptions;
    private horizontalRuler: Container;
    private verticalRuler: Container;
    private graphics: Graphics;

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

        this.addChild(this.horizontalRuler);
        this.addChild(this.verticalRuler);

        this.draw();
    }

    private draw() {
        this.graphics.clear();

        // 绘制水平标尺背景
        this.graphics.beginFill(0xffffff);
        this.graphics.drawRect(
            this.options.thickness,
            0,
            this.options.width,
            this.options.thickness
        );
        this.graphics.endFill();

        // 绘制垂直标尺背景
        this.graphics.beginFill(0xffffff);
        this.graphics.drawRect(
            0,
            this.options.thickness,
            this.options.thickness,
            this.options.height
        );
        this.graphics.endFill();

        // 绘制左上角方块
        this.graphics.beginFill(0xffffff);
        this.graphics.drawRect(
            0,
            0,
            this.options.thickness,
            this.options.thickness
        );
        this.graphics.endFill();

        // 绘制水平刻度
        this.drawHorizontalMarks();

        // 绘制垂直刻度
        this.drawVerticalMarks();
    }

    private drawHorizontalMarks() {
        const { unit, majorUnit, thickness, width, color } = this.options;

        for (let x = 0; x <= width; x += unit) {
            const isMajor = (x / unit) % majorUnit === 0;
            const markHeight = isMajor ? thickness / 2 : thickness / 3;

            this.graphics.lineStyle(1, color);
            this.graphics.moveTo(x + thickness, thickness);
            this.graphics.lineTo(x + thickness, thickness - markHeight);

            // 在大刻度处添加数字
            if (isMajor) {
                const text = new Text({
                    text: x.toString(),
                    style: {
                        fontSize: 10,
                        fill: color,
                    },
                });
                text.position.set(x + thickness - text.width / 2, 2);
                this.horizontalRuler.addChild(text);
            }
        }
    }

    private drawVerticalMarks() {
        const { unit, majorUnit, thickness, height, color } = this.options;

        for (let y = 0; y <= height; y += unit) {
            const isMajor = (y / unit) % majorUnit === 0;
            const markWidth = isMajor ? thickness / 2 : thickness / 3;

            this.graphics.lineStyle(1, color);
            this.graphics.moveTo(thickness, y + thickness);
            this.graphics.lineTo(thickness - markWidth, y + thickness);

            // 在大刻度处添加数字
            if (isMajor) {
                const text = new Text({
                    text: y.toString(),
                    style: {
                        fontSize: 10,
                        fill: color,
                    },
                });
                text.position.set(2, y + thickness - text.height / 2);
                this.verticalRuler.addChild(text);
            }
        }
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
}
