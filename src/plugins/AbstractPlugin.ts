import { Application, Container } from 'pixi.js';
import { CanvasLayers } from '../types';

export abstract class AbstractPlugin {
    protected app: Application;
    protected layers: {
        canvasZone: Container;
        topLayer: Container;
        mainZone: Container;
    };
    constructor() {}

    public activate(app: Application, layers: CanvasLayers): void {
        this.app = app;
        this.layers = layers;
        this.init();
    }

    public abstract init(): void;

    public abstract onLoad(): void;
}
