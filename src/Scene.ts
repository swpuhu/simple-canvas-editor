import { Application, Container, Graphics } from 'pixi.js';
import { RULER_THICKNESS } from './consts';

export class Scene {
    private _canvasZone: Container;
    private _topLayer: Container;
    private remainWidth: number;
    private remainHeight: number;
    private centerX: number;
    private centerY: number;
    private mainZone: Container;
    private mainZoneGraphic: Graphics;

    constructor(private app: Application) {
        this.initScene();
    }

    get canvasZone() {
        return this._canvasZone;
    }

    get topLayer() {
        return this._topLayer;
    }

    initScene() {
        const app = this.app;

        const mainZone = new Container();
        this.mainZone = mainZone;
        const mainZoneGraphic = new Graphics();
        this.mainZoneGraphic = mainZoneGraphic;

        const remainWidth = this.app.screen.width - RULER_THICKNESS;
        const remainHeight = this.app.screen.height - RULER_THICKNESS;

        console.log('mainZone', remainWidth, remainHeight);
        const centerX = RULER_THICKNESS + remainWidth / 2;
        const centerY = RULER_THICKNESS + remainHeight / 2;
        mainZone.x = centerX;
        mainZone.y = centerY;
        mainZone.setSize(remainWidth, remainHeight);

        mainZoneGraphic.rect(
            -remainWidth / 2,
            -remainHeight / 2,
            remainWidth,
            remainHeight
        );
        mainZoneGraphic.circle(0, 0, 3);
        mainZoneGraphic.fill({ color: 0xcccccc, alpha: 0.5 });
        mainZone.addChild(mainZoneGraphic);
        app.stage.addChild(mainZone);

        const canvasZone = new Container();
        const canvasHeight = remainHeight * 0.8;
        const canvasWidth = canvasHeight * 0.6;

        const canvasBackground = new Graphics();
        canvasBackground.setSize(canvasWidth, canvasHeight);
        canvasBackground.rect(
            -canvasWidth / 2,
            -canvasHeight / 2,
            canvasWidth,
            canvasHeight
        );
        canvasBackground.fill({ color: 0xffffff });
        canvasBackground.stroke({ color: 0xfb6, width: 2 });

        const canvasMask = new Graphics();
        canvasMask.rect(
            -canvasWidth / 2,
            -canvasHeight / 2,
            canvasWidth,
            canvasHeight
        );
        canvasMask.fill({ color: 0xffffff });

        canvasZone.addChild(canvasBackground);
        canvasZone.mask = canvasMask;
        canvasZone.addChild(canvasMask);

        mainZone.addChild(canvasZone);

        const topLayer = new Container();
        topLayer.position.set(canvasZone.x, canvasZone.y);
        mainZone.addChild(topLayer);

        console.log('canvasZone', canvasZone.width, canvasZone.height);

        this._canvasZone = canvasZone;
        this._topLayer = topLayer;

        this.remainWidth = remainWidth;
        this.remainHeight = remainHeight;
        this.centerX = centerX;
        this.centerY = centerY;
    }

    public resize(width: number, height: number) {
        this.remainWidth = width - RULER_THICKNESS;
        this.remainHeight = height - RULER_THICKNESS;
        this.centerX = RULER_THICKNESS + this.remainWidth / 2;
        this.centerY = RULER_THICKNESS + this.remainHeight / 2;

        this.mainZone.position.set(this.centerX, this.centerY);
        this.mainZoneGraphic.clear();
        this.mainZoneGraphic.rect(
            -this.remainWidth / 2,
            -this.remainHeight / 2,
            this.remainWidth,
            this.remainHeight
        );
        this.mainZoneGraphic.fill({ color: 0xcccccc, alpha: 0.5 });
    }
}
