import { Sprite } from 'pixi.js';

export function setupCounter(element: HTMLButtonElement): void;

interface SpriteMetadata {
    originalUrl: string;
    createdAt: string;
    hash: string;
}

declare module 'pixi.js' {
    interface Sprite {
        userData?: SpriteMetadata;
        metadata?: SpriteMetadata;
    }
}
