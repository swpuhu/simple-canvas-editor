import { Application, Text, CanvasTextMetrics } from 'pixi.js';

export async function main() {
    const app = new Application();

    await app.init({
        width: 640,
        height: 480,
    });

    document.body.appendChild(app.canvas);

    const text = new Text({
        text: 'Hello Pixi!',
        style: {
            fill: 0xff0000,
            fontSize: 48,
            fontFamily: 'Arial',
        },
    });

    const textMetrics = CanvasTextMetrics.measureText(
        'Hello Pixi',
        text.style,
        app.renderer.canvas
    );
    console.log(textMetrics);

    console.log(text.getBounds());
    app.stage.addChild(text);

    // app.ticker.stop();
    // app.ticker.autoStart = false;
}
