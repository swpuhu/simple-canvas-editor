import './style.css';
import { Application, Container, Text } from 'pixi.js';
import { Ruler } from './plugins/RulerPlugin';
import { Scene } from './Scene';
import { SelectionController } from './plugins/SelectionControllerPlugin';
import { PluginManager } from './PluginManager';
import { FileDropPlugin } from './plugins/FileDropPlugin';
import { ZoomControllerPlugin } from './plugins/ZoomControllerPlugin';
import './polyfill';
import { Events } from './consts';
import { deserializePixiElement, serialize } from './utils/serialize';

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
        designHeight: 500,
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
    zoomControllerPlugin.on(Events.CANVAS_TRANSLATE, () => {
        ruler.reDraw();
    });
    ruler.setZoom(zoomControllerPlugin.getCurrentZoom());
    zoomControllerPlugin.setOnZoomChange(zoom => {
        ruler.setZoom(zoom);
        selectionController.updateSelf();
        scene.onZoomChange(zoom);
    });

    pluginManager.ready();

    app.renderer.on('resize', () => {
        scene.resize(app.renderer.width, app.renderer.height);
    });

    return scene.contentZone;
}

// 创建Pixi应用
async function initApp(width: number, height: number) {
    const contentZone = await initScene(width, height);

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
        contentZone.addChild(text);
    }
    window.canvasZone = contentZone;
    window.serialize = serialize;
    window.deserializePixiElement = deserialize;
}

function loadMockDataTest(): void {
    fetch('/mock/simple.json')
        .then(response => response.json())
        .then(data => {
            const element = deserializePixiElement(data.element);
            if (element) {
                // canvasZone.addChild(element);
                console.log(element);
                if (window.canvasZone) {
                    const canvasZone: Container = (window as any).canvasZone;
                    canvasZone.width = element.width;
                    canvasZone.height = element.height;
                    element.children?.forEach(child => {
                        canvasZone.addChild(child);
                    });
                }
            }
        });
}

window.loadMockDataTest = loadMockDataTest;

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
initApp(screenWidth, screenHeight);
