import { Sprite } from 'pixi.js';

export function changeAnchor(
    sprite: Sprite,
    anchor: { x: number; y: number }
): void {
    const currentAnchor = sprite.anchor;
    const deltaAnchorX = anchor.x - currentAnchor.x;
    const deltaAnchorY = anchor.y - currentAnchor.y;
    sprite.x += deltaAnchorX * sprite.width;
    sprite.y += deltaAnchorY * sprite.height;
    sprite.anchor.set(anchor.x, anchor.y);
}

window.changeAnchor = changeAnchor;
