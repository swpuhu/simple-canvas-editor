import './style.css';
import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js';
import { Ruler } from './Ruler';
import { FileDrop } from './FileDrop';
import { SpriteLoader } from './SpriteLoader';
import { SelectionController } from './SelectionController';
import { ZoomController } from './ZoomController';

async function initScene(width: number, height: number): Promise<Container> {
    const app = new Application();

    await app.init({
        width: width,
        height: height,
        backgroundColor: 0xffffff,
    });

    document.querySelector('#app')?.appendChild(app.view as HTMLCanvasElement);

    // 创建SpriteLoader实例
    const spriteLoader = new SpriteLoader(app);

    const RULER_THICKNESS = 30;

    const mainZone = new Graphics();

    const remainWidth = app.screen.width - RULER_THICKNESS;
    const remainHeight = app.screen.height - RULER_THICKNESS;

    console.log('mainZone', remainWidth, remainHeight);
    const centerX = RULER_THICKNESS + remainWidth / 2;
    const centerY = RULER_THICKNESS + remainHeight / 2;
    mainZone.x = centerX;
    mainZone.y = centerY;
    mainZone.setSize(remainWidth, remainHeight);

    mainZone.rect(
        -remainWidth / 2,
        -remainHeight / 2,
        remainWidth,
        remainHeight
    );
    mainZone.circle(0, 0, 3);
    mainZone.fill({ color: 0xcccccc, alpha: 0.5 });
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
    console.log('canvasZone', canvasZone.width, canvasZone.height);

    const ruler = new Ruler(app, canvasZone, {
        width: remainWidth,
        height: remainHeight,
        thickness: RULER_THICKNESS,
    });
    console.log('ruler', ruler.width, ruler.height);

    app.stage.addChild(ruler);

    // 创建拖放区域
    const dropZone = document.querySelector('#app') as HTMLElement;

    // 初始化文件拖放
    new FileDrop(dropZone, {
        accept: ['image/jpeg', 'image/png', 'image/gif'],
        multiple: true,
        onDrop: async (urlAndHashes: string[][], event: DragEvent) => {
            console.log(urlAndHashes);
            try {
                const canvasBounds = app.canvas.getBoundingClientRect();
                const x = event.clientX - canvasBounds.left;
                const y = event.clientY - canvasBounds.top;

                const posInCanvasZone = canvasZone.toLocal({ x, y }, app.stage);

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

    const topLayer = new Container();
    topLayer.position.set(canvasZone.x, canvasZone.y);
    app.stage.addChild(topLayer);
    const selectionController = new SelectionController(app, topLayer);
    new ZoomController(app, [canvasZone, topLayer], zoom => {
        // 这里可以处理缩放变化，例如更新标尺
        ruler.setZoom(zoom);
        selectionController.updateSelf();
    });

    return canvasZone;
}

// 创建Pixi应用
async function initApp(width: number, height: number) {
    const canvasZone = await initScene(width, height);
    const text = new Text({
        text: 'Hello, World!',
        style: {
            fontSize: 200,
            fill: 0x000000,
        },
    });

    text.eventMode = 'static';
    text.cursor = 'pointer';
    canvasZone.addChild(text);
    // const transformPanel = new TransformPanel(app, selectionController);
}

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
initApp(screenWidth, screenHeight);
