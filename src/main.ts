import './style.css';
import { Application } from 'pixi.js';
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

    const ruler = new Ruler({
        width: app.screen.width,
        height: app.screen.height,
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
                const canvasBounds = app.view.getBoundingClientRect();

                // 计算鼠标相对于画布的位置
                const x = event.clientX - canvasBounds.left;
                const y = event.clientY - canvasBounds.top;

                // 将拖入的图片转换为Sprite
                const sprites = await spriteLoader.loadMultipleSprites(
                    urls.map(url => ({
                        url,
                        options: {
                            x, // 使用鼠标位置
                            y, // 使用鼠标位置
                            anchor: { x: 0.5, y: 0.5 }, // 使用中心点作为锚点
                            interactive: true,
                        },
                    }))
                );

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
