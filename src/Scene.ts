import {
    Application,
    Container,
    Geometry,
    Graphics,
    Mesh,
    Shader,
} from 'pixi.js';
import { RULER_THICKNESS } from './consts';
import { computeViewSize } from './utils/util';
import { QuadGeometry } from './geometry/QuadGeometry';
import normalVertex from './shaders/normal.vert.glsl';
import shadowFrag from './shaders/rectShadow.frag.glsl';

export class Scene {
    private _canvasZone: Container;
    private _topLayer: Container;
    private _bottomLayer: Container;
    private remainWidth: number;
    private remainHeight: number;
    private centerX: number;
    private centerY: number;
    private _mainZone: Container;
    private mainZoneGraphic: Graphics;
    private designWidth: number = 0;
    private designHeight: number = 0;
    private shadowMesh: Mesh<Geometry, Shader>;
    constructor(
        private app: Application,
        options?: {
            designWidth: number;
            designHeight: number;
        }
    ) {
        this.designWidth = this.app.screen.width - RULER_THICKNESS;
        this.designHeight = this.app.screen.height - RULER_THICKNESS;
        if (options) {
            this.designWidth = options.designWidth;
            this.designHeight = options.designHeight;
        }
        this.initScene();
    }

    get canvasZone() {
        return this._canvasZone;
    }

    get topLayer() {
        return this._topLayer;
    }

    get bottomLayer() {
        return this._bottomLayer;
    }

    get mainZone() {
        return this._mainZone;
    }

    initScene() {
        const app = this.app;

        const mainZone = new Container();
        const backgroundZone = new Container();
        const backgroundGraphic = new Graphics();

        this._mainZone = mainZone;

        const remainWidth = this.app.screen.width - RULER_THICKNESS;
        const remainHeight = this.app.screen.height - RULER_THICKNESS;

        const centerX = RULER_THICKNESS + remainWidth / 2;
        const centerY = RULER_THICKNESS + remainHeight / 2;

        backgroundZone.addChild(backgroundGraphic);
        backgroundZone.position.set(centerX, centerY);
        backgroundZone.setSize(remainWidth, remainHeight);

        backgroundGraphic.rect(
            -remainWidth / 2,
            -remainHeight / 2,
            remainWidth,
            remainHeight
        );
        backgroundGraphic.circle(0, 0, 3);
        backgroundGraphic.fill({ color: 0xcccccc, alpha: 1.0 });

        const backgroundMask = new Graphics();
        backgroundMask.rect(
            -remainWidth / 2,
            -remainHeight / 2,
            remainWidth,
            remainHeight
        );
        backgroundMask.fill({ color: 0xffffff });
        backgroundZone.mask = backgroundMask;
        backgroundZone.addChild(backgroundMask);

        const canvasZone = new Container();
        const { width: realWidth, height: realHeight } = computeViewSize(
            remainWidth,
            remainHeight,
            this.designWidth,
            this.designHeight
        );
        const canvasHeight = this.designHeight;
        const canvasWidth = this.designWidth;
        const scaleX = realWidth / canvasWidth;
        const scaleY = realHeight / canvasHeight;

        const canvasZoneGraphics = new Graphics();
        const quadGeometry = new QuadGeometry(realWidth + 50, realHeight + 50);
        const shader = Shader.from({
            gl: {
                vertex: normalVertex,
                fragment: shadowFrag,
            },
            resources: {
                shadowUniforms: {
                    uSize: {
                        type: 'vec2<f32>',
                        value: [realWidth + 50, realHeight + 50],
                    },
                    uColor: {
                        type: 'vec3<f32>',
                        value: [0.5, 0.5, 0.5],
                    },
                    uPad: {
                        type: 'f32',
                        value: 50.0,
                    },
                },
            },
        });

        const shadowMesh = new Mesh(quadGeometry.geo, shader);
        this.shadowMesh = shadowMesh;
        mainZone.addChild(shadowMesh);

        canvasZoneGraphics.setSize(canvasWidth, canvasHeight);
        canvasZoneGraphics.rect(
            -canvasWidth / 2,
            -canvasHeight / 2,
            canvasWidth,
            canvasHeight
        );
        canvasZoneGraphics.fill({ color: 0xffffff });
        canvasZoneGraphics.stroke({ color: 0xfb6, width: 2 });

        const canvasMask = new Graphics();
        canvasMask.rect(
            -canvasWidth / 2,
            -canvasHeight / 2,
            canvasWidth,
            canvasHeight
        );
        canvasMask.fill({ color: 0xffffff });

        canvasZone.addChild(canvasZoneGraphics);
        canvasZone.mask = canvasMask;
        canvasZone.addChild(canvasMask);

        mainZone.addChild(canvasZone);

        const topLayer = new Container();
        topLayer.position.set(mainZone.x, mainZone.y);
        mainZone.addChild(topLayer);

        const bottomLayer = new Container();
        console.log('bottomLayer', mainZone.x, mainZone.y);
        bottomLayer.position.set(mainZone.x, mainZone.y);
        mainZone.addChild(bottomLayer);

        canvasZone.scale.set(scaleX, scaleY);
        topLayer.scale.set(scaleX, scaleY);

        console.log('canvasZone', canvasZone.width, canvasZone.height);

        this._canvasZone = canvasZone;
        this._topLayer = topLayer;
        this._bottomLayer = bottomLayer;
        this.remainWidth = remainWidth;
        this.remainHeight = remainHeight;
        this.centerX = centerX;
        this.centerY = centerY;

        app.stage.addChild(this._bottomLayer);
        backgroundZone.addChild(mainZone);
        app.stage.addChild(backgroundZone);
    }

    public onZoomChange(zoom: number) {}

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
