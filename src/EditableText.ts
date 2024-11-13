import { Application, Text } from 'pixi.js';

export class EditableText {
    private app: Application;
    private text: Text;
    private textInput: HTMLInputElement;
    private isEditing: boolean = false;

    constructor(app: Application) {
        this.app = app;

        // 创建Pixi文本
        this.text = new Text({
            text: '点击编辑文字',
            style: {
                fill: 0xff0000,
                fontSize: 48,
                fontFamily: 'Arial',
            },
        });

        this.text.position.set(400, 300);
        this.text.anchor.set(0.5);
        this.text.eventMode = 'static';
        this.text.cursor = 'pointer';

        this.app.stage.addChild(this.text);

        // 创建输入框元素
        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.className = 'text-input';
        document.querySelector('#app')?.appendChild(this.textInput);

        // 绑定事件
        this.setupEvents();
    }

    private setupEvents() {
        // 点击文本时显示输入框
        this.text.on('pointerdown', event => {
            event.stopPropagation();
            if (!this.isEditing) {
                this.startEditing();
            }
        });

        // 输入框失去焦点时隐藏
        this.textInput.addEventListener('blur', () => {
            this.stopEditing();
        });

        // 按下回车时确认编辑
        this.textInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                this.stopEditing();
            }
        });

        // 输入时更新Pixi文本
        this.textInput.addEventListener('input', () => {
            this.text.text = this.textInput.value;
        });
    }

    private startEditing() {
        this.isEditing = true;

        // 获取文本在页面上的位置
        const bounds = this.text.getBounds();
        const canvasRect = this.app.canvas.getBoundingClientRect();

        // 设置输入框位置和样式
        this.textInput.style.display = 'block';
        this.textInput.style.fontSize = `${this.text.style.fontSize}px`;
        this.textInput.style.left = `${canvasRect.left + bounds.x}px`;
        this.textInput.style.top = `${canvasRect.top + bounds.y}px`;
        this.textInput.style.width = `${bounds.width}px`;
        this.textInput.style.height = `${bounds.height}px`;

        // 设置当前文本内容
        this.textInput.value = this.text.text;
        this.textInput.focus();
    }

    private stopEditing() {
        this.isEditing = false;
        this.textInput.style.display = 'none';
        this.text.text = this.textInput.value;
    }

    // 获取文本内容
    getText(): string {
        return this.text.text;
    }

    // 设置文本内容
    setText(newText: string) {
        this.text.text = newText;
    }

    // 设置文本位置
    setPosition(x: number, y: number) {
        this.text.position.set(x, y);
    }

    // 获取Text对象
    getTextObject(): Text {
        return this.text;
    }
}
