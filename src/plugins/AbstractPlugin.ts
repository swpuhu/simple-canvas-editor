import { Application, Container, EventEmitter } from 'pixi.js';
import { CanvasLayers } from '../types';

export abstract class AbstractPlugin {
    protected app: Application;

    protected emitter: EventEmitter;
    protected layers: {
        canvasZone: Container;
        topLayer: Container;
        mainZone: Container;
    };
    constructor() {
        this.emitter = new EventEmitter();
    }

    public activate(app: Application, layers: CanvasLayers): void {
        this.app = app;
        this.layers = layers;
        this.init();
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this.emitter.on(event, listener);
    }

    public off(event: string, listener: (...args: any[]) => void): void {
        this.emitter.off(event, listener);
    }

    public emit(event: string, ...args: any[]): void {
        this.emitter.emit(event, ...args);
    }

    public abstract init(): void;

    public abstract onLoad(): void;

    protected onDestroy(): void {}

    public destroy(): void {
        this.emitter.removeAllListeners();
        this.onDestroy();
    }
}
