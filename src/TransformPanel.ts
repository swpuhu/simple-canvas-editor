import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SelectionController } from './plugins/SelectionControllerPlugin';

export class TransformPanel {
    private app: Application;
    private selectionController: SelectionController;
    private container: Container;
    private panel: Graphics;
    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private rotationInput: HTMLInputElement;

    constructor(app: Application, selectionController: SelectionController) {
        this.app = app;
        this.selectionController = selectionController;
        this.container = new Container();

        this.createHTMLControls();
        this.updateControlsVisibility();

        // 添加更新循环
        app.ticker.add(this.update.bind(this));
    }

    private createHTMLControls(): void {
        const controlsDiv = document.createElement('div');
        controlsDiv.style.position = 'absolute';
        controlsDiv.style.top = '10px';
        controlsDiv.style.right = '10px';
        controlsDiv.style.padding = '10px';
        controlsDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        controlsDiv.style.borderRadius = '5px';

        // 宽度控制
        this.widthInput = this.createInput('宽度：');
        // 高度控制
        this.heightInput = this.createInput('高度：');
        // 旋转控制
        this.rotationInput = this.createInput('旋转：');

        controlsDiv.appendChild(
            this.createInputGroup('宽度：', this.widthInput)
        );
        controlsDiv.appendChild(
            this.createInputGroup('高度：', this.heightInput)
        );
        controlsDiv.appendChild(
            this.createInputGroup('旋转：', this.rotationInput)
        );

        document.body.appendChild(controlsDiv);

        this.setupEventListeners();
    }

    private createInput(label: string): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'number';
        input.style.width = '60px';
        return input;
    }

    private createInputGroup(
        label: string,
        input: HTMLInputElement
    ): HTMLDivElement {
        const group = document.createElement('div');
        group.style.marginBottom = '5px';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;

        group.appendChild(labelElement);
        group.appendChild(input);

        return group;
    }

    private setupEventListeners(): void {
        this.widthInput.addEventListener('change', () => {
            const sprite = this.selectionController.getSelectedSprite();
            if (sprite) {
                this.selectionController.resizeSelectedSprite(
                    Number(this.widthInput.value),
                    sprite.height
                );
            }
        });

        this.heightInput.addEventListener('change', () => {
            const sprite = this.selectionController.getSelectedSprite();
            if (sprite) {
                this.selectionController.resizeSelectedSprite(
                    sprite.width,
                    Number(this.heightInput.value)
                );
            }
        });

        this.rotationInput.addEventListener('change', () => {
            const sprite = this.selectionController.getSelectedSprite();
            if (sprite) {
                this.selectionController.rotateSelectedSprite(
                    Number(this.rotationInput.value)
                );
            }
        });
    }

    private updateControlsVisibility(): void {
        const sprite = this.selectionController.getSelectedSprite();
        if (sprite) {
            this.widthInput.value = sprite.width.toString();
            this.heightInput.value = sprite.height.toString();
            this.rotationInput.value = sprite.angle.toString();
        }
    }

    private update(): void {
        this.updateControlsVisibility();
    }
}
