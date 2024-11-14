import * as PIXI from 'pixi.js';

declare module 'pixi.js' {
    interface Container {
        metadata?: {
            [key: string]: any;
            hash: string;
        };
    }
}
