import './style.css';
import { Application, Container, Text } from 'pixi.js';
import { Ruler } from './plugins/RulerPlugin';
import { Scene } from './Scene';
import { SelectionController } from './plugins/SelectionControllerPlugin';
import { PluginManager } from './PluginManager';
import { FileDropPlugin } from './plugins/FileDropPlugin';
import { ZoomControllerPlugin } from './plugins/ZoomControllerPlugin';
import './polyfill';

async function initScene(width: number, height: number): Promise<Container> {
    const app = new Application();

    const container: HTMLElement | null = document.querySelector('#app');
    if (!container) {
        throw new Error('container not found');
    }
    await app.init({
        width: width,
        height: height,
        backgroundColor: 0xffffff,
        resizeTo: container,
    });

    container.appendChild(app.canvas as HTMLCanvasElement);

    const scene = new Scene(app, {
        designWidth: 800,
        designHeight: 1080,
    });

    const pluginManager = new PluginManager(app, {
        canvasZone: scene.canvasZone,
        topLayer: scene.topLayer,
        mainZone: scene.mainZone,
    });

    const ruler = pluginManager.usePlugin(Ruler);
    pluginManager.usePlugin(FileDropPlugin);
    const selectionController = pluginManager.usePlugin(SelectionController);
    const zoomControllerPlugin = pluginManager.usePlugin(ZoomControllerPlugin);
    zoomControllerPlugin.setOnZoomChange(zoom => {
        ruler.setZoom(zoom);
        selectionController.updateSelf();
        scene.onZoomChange(zoom);
    });

    pluginManager.ready();

    app.renderer.on('resize', () => {
        scene.resize(app.renderer.width, app.renderer.height);
    });

    return scene.canvasZone;
}

// 创建Pixi应用
async function initApp(width: number, height: number) {
    const canvasZone = await initScene(width, height);

    {
        // test code
        const text = new Text({
            text: 'Hello, World!',
            style: {
                fontSize: 50,
                fill: 0x000000,
            },
        });

        text.eventMode = 'static';
        text.cursor = 'pointer';
        canvasZone.addChild(text);
    }
}

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
initApp(screenWidth, screenHeight);
