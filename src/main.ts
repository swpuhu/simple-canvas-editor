import './style.css';
import { Application, Container, Graphics, ViewContainer } from 'pixi.js';
import { EditableText } from './EditableText';
import { Ruler } from './Ruler';
import { FileDrop } from './FileDrop';
import { SpriteLoader } from './SpriteLoader';
import { SelectionController } from './SelectionController';
import { TransformPanel } from './TransformPanel';

// 创建Pixi应用
async function initApp() {
    const app = new Application();

    await app.init({
        width: 800,
        height: 600,
        backgroundColor: 0xffffff,
    });

    document.querySelector('#app')?.appendChild(app.view as HTMLCanvasElement);

    // 创建SpriteLoader实例
    const spriteLoader = new SpriteLoader(app);

    const RULER_THICKNESS = 30;

    const mainZone = new Container();

    const width = app.screen.width - RULER_THICKNESS;
    const height = app.screen.height - RULER_THICKNESS;

    console.log('mainZone', width, height);
    const centerX = RULER_THICKNESS + width / 2;
    const centerY = RULER_THICKNESS + height / 2;
    mainZone.x = centerX;
    mainZone.y = centerY;
    mainZone.setSize(width, height);

    const mainZoneGraphics = new Graphics();
    mainZone.addChild(mainZoneGraphics);

    mainZoneGraphics.rect(-width / 2, -height / 2, width, height);
    mainZoneGraphics.circle(0, 0, 3);
    mainZoneGraphics.stroke({ color: 0x000000, width: 3, alignment: 1 });
    app.stage.addChild(mainZone);

    const ruler = new Ruler({
        width: width,
        height: height,
        thickness: RULER_THICKNESS,
        measureContainer: mainZone,
    });

    app.stage.addChild(ruler);

    // 创建拖放区域
    const dropZone = document.querySelector('#app') as HTMLElement;

    // 初始化文件拖放
    const fileDrop = new FileDrop(dropZone, {
        accept: ['image/jpeg', 'image/png', 'image/gif'],
        multiple: true,
        onDrop: async (urls: string[], event: DragEvent) => {
            try {
                // 获取画布相对于视口的位置
                const canvasBounds = app.canvas.getBoundingClientRect();

                // 计算鼠标相对于画布的位置
                const x = event.clientX - canvasBounds.left;
                const y = event.clientY - canvasBounds.top;

                const posInMainZone = mainZone.toLocal({ x, y });

                // 将拖入的图片转换为Sprite
                const sprites = await spriteLoader.loadMultipleSprites(
                    urls.map(url => ({
                        url,
                        options: {
                            x: posInMainZone.x, // 使用鼠标位置
                            y: posInMainZone.y, // 使用鼠标位置
                            anchor: { x: 0.5, y: 0.5 }, // 使用中心点作为锚点
                            interactive: true,
                            scale: { x: 1, y: 1 },
                        },
                        parent: mainZone,
                    }))
                );
                window.sprites = sprites;

                // 为每个Sprite添加交互
                // sprites.forEach(sprite => {
                //     // 添加点击处理
                //     sprite.on('pointerdown', event => {
                //         // 可以在这里添加选中、删除等操作
                //         console.log(
                //             'Sprite clicked at',
                //             event.global.x,
                //             event.global.y
                //         );
                //     });
                // });
            } catch (error) {
                console.error('加载Sprite失败:', error);
            }
        },
        onError: (error: string) => {
            console.error('文件处理错误:', error);
        },
    });

    const selectionController = new SelectionController(app);
    const transformPanel = new TransformPanel(app, selectionController);
}

initApp();
