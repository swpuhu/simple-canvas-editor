import {
    Container,
    EventMode,
    Graphics,
    Sprite,
    Text,
    TextStyleFontStyle,
    TextStyleFontVariant,
    TextStyleFontWeight,
    TextStyleTextBaseline,
    TextStyleWhiteSpace,
} from 'pixi.js';

interface CommonProperty {
    type: string; // 元素类型
    x: number; // x坐标
    y: number; // y坐标
    originWidth?: number; // 原始宽度
    originHeight?: number; // 原始高度
    rotation?: number; // 旋转角度
    scale?: {
        // 缩放
        x: number;
        y: number;
    };
    alpha?: number; // 透明度
    visible?: boolean; // 是否可见
    eventMode?: EventMode; // 事件模式
    children?: SerializedPixiElement[]; // 子元素
    properties?: {
        // 特定类型的额外属性
        [key: string]: any;
    };
}
// 序列化接口定义
type SerializedPixiElement = CommonProperty & ({} | TextProperties);

interface TextProperties {
    text: string;
    style: SerializedTextStyle;
}

interface SerializedTextStyle {
    text: string;
    fontStyle: TextStyleFontStyle;
    fontVariant: TextStyleFontVariant;
    fontWeight: TextStyleFontWeight;
    leading: number;
    letterSpacing: number;
    fontFamily: string;
    fontSize: number;
    padding: number;
    trim: boolean;
    textBaseline: TextStyleTextBaseline;
    whiteSpace: TextStyleWhiteSpace;
    wordWrap: boolean;
    wordWrapWidth: number;
}

export function serialize(element: Container): {
    version: string;
    element: SerializedPixiElement;
} {
    const result = serializePixiElement(element);
    if (!result) {
        throw new Error('序列化失败');
    }
    return {
        version: '1.0.0',
        element: result,
    };
}

// 序列化函数
export function serializePixiElement(
    element: Container
): SerializedPixiElement | null {
    if (element instanceof Graphics) {
        return null;
    }
    const scale = element.scale;
    const base: SerializedPixiElement = {
        type:
            element instanceof Text
                ? 'Text'
                : element instanceof Sprite
                ? 'Sprite'
                : 'Container',
        x: element.x,
        y: element.y,
        originWidth: element.width / scale.x,
        originHeight: element.height / scale.y,
    };

    // 添加基本属性
    if (element.eventMode) base.eventMode = element.eventMode;
    if (element.rotation) base.rotation = element.rotation;
    if (element.scale.x !== 1 || element.scale.y !== 1) {
        base.scale = {
            x: element.scale.x,
            y: element.scale.y,
        };
    }
    if (element.alpha !== 1) base.alpha = element.alpha;
    if (!element.visible) base.visible = false;

    // 处理特定类型的属性
    if (element instanceof Text) {
        base.type = 'Text';
        base.properties = {
            text: element.text,
            style: {
                fontStyle: element.style.fontStyle,
                fontVariant: element.style.fontVariant,
                fontWeight: element.style.fontWeight,
                leading: element.style.leading,
                letterSpacing: element.style.letterSpacing,
                fontFamily: element.style.fontFamily,
                fontSize: element.style.fontSize,
                padding: element.style.padding,
                trim: element.style.trim,
                textBaseline: element.style.textBaseline,
                whiteSpace: element.style.whiteSpace,
                wordWrap: element.style.wordWrap,
                wordWrapWidth: element.style.wordWrapWidth,
            },
        };
    } else if (element instanceof Sprite) {
        base.properties = {
            url: element.metadata?.serverUrl,
            hash: element.metadata?.hash,
        };
    }

    // 处理子元素
    if (element instanceof Container && element.children.length > 0) {
        base.children = element.children
            .map(child => serializePixiElement(child))
            .filter(item => !!item);
    }

    return base;
}

// 反序列化函数
export function deserializePixiElement(json: SerializedPixiElement): Container {
    let element: Container | null = null;

    // 根据类型创建相应的PIXI对象
    switch (json.type) {
        case 'Text':
            element = new Text({
                text: json.properties?.text,
                style: {
                    fontStyle: json.properties?.style.fontStyle,
                    fontVariant: json.properties?.style.fontVariant,
                    fontWeight: json.properties?.style.fontWeight,
                    leading: json.properties?.style.leading,
                    letterSpacing: json.properties?.style.letterSpacing,
                    fontFamily: json.properties?.style.fontFamily,
                    fontSize: json.properties?.style.fontSize,
                    padding: json.properties?.style.padding,
                    trim: json.properties?.style.trim,
                    textBaseline: json.properties?.style.textBaseline,
                    whiteSpace: json.properties?.style.whiteSpace,
                    wordWrap: json.properties?.style.wordWrap,
                    wordWrapWidth: json.properties?.style.wordWrapWidth,
                },
            });
            break;
        case 'Sprite':
            if (!json.properties?.text) {
                element = Sprite.from(json.properties?.url);
            }
            break;
        case 'Container':
            element = new Container();
            break;
        default:
            throw new Error(`未知的元素类型: ${json.type}`);
    }
    if (!element) {
        element = new Container();
    }

    // 设置基本属性
    element.eventMode = json.eventMode;
    element.x = json.x;
    element.y = json.y;
    if (json.rotation) element.rotation = json.rotation;
    if (json.scale) {
        element.scale.set(json.scale.x, json.scale.y);
    }
    if (json.alpha !== undefined) element.alpha = json.alpha;
    if (json.visible !== undefined) element.visible = json.visible;

    // 处理子元素
    if (json.children) {
        json.children.forEach(childJson => {
            const child = deserializePixiElement(childJson);
            element.addChild(child);
        });
    }

    return element;
}
