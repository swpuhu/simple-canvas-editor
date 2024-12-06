import { Application, Container } from 'pixi.js';

export abstract class AbstractPlugin {
    protected app: Application;
    constructor() {}

    public activate(
        app: Application,
        layers: { canvasZone: Container; topLayer: Container }
    ): void {
        this.app = app;
        this.init(app, layers);
    }

    public abstract init(
        app: Application,
        layers: {
            canvasZone: Container;
            topLayer: Container;
        }
    ): void;

    public abstract onLoad(): void;
}
