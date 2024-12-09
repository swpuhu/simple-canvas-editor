import * as PIXI from 'pixi.js';

declare module 'pixi.js' {
    interface Container {
        metadata?: {
            [key: string]: any;
        };
    }

    interface Sprite {
        metadata?: {
            url?: string;
            hash?: string;
            serverUrl?: string;
        };
    }
}
