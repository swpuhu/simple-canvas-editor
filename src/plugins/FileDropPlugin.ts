import { Application, Container } from 'pixi.js';
import { AbstractPlugin } from './AbstractPlugin';
import { FileDrop } from '../utils/FileDrop';
import { spriteLoader } from '../SpriteLoader';

export class FileDropPlugin extends AbstractPlugin {
    public init(): void {
        const canvasZone = this.layers.canvasZone;
        new FileDrop(this.app.canvas, {
            accept: ['image/jpeg', 'image/png', 'image/gif'],
            multiple: true,
            onDrop: async (urlAndHashes: string[][], event: DragEvent) => {
                console.log(urlAndHashes);
                try {
                    const canvasBounds =
                        this.app.canvas.getBoundingClientRect();
                    const x = event.clientX - canvasBounds.left;
                    const y = event.clientY - canvasBounds.top;

                    const posInCanvasZone = canvasZone.toLocal(
                        { x, y },
                        this.app.stage
                    );

                    await spriteLoader.loadMultipleSprites(
                        urlAndHashes.map(urlAndHash => ({
                            url: urlAndHash[0],
                            hash: urlAndHash[1],
                            options: {
                                x: posInCanvasZone.x,
                                y: posInCanvasZone.y,
                                anchor: { x: 0.5, y: 0.5 },
                                interactive: true,
                                scale: { x: 1, y: 1 },
                            },
                            parent: canvasZone,
                        }))
                    );
                } catch (error) {
                    console.error('加载Sprite失败:', error);
                }
            },
            onError: (error: string) => {
                console.error('文件处理错误:', error);
            },
        });
    }
    public onLoad(): void {}
}
