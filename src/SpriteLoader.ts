import { Sprite, Assets, Container } from 'pixi.js';

export interface SpriteOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    anchor?: { x: number; y: number };
    scale?: { x: number; y: number };
    alpha?: number;
    interactive?: boolean;
}

class SpriteLoader {
    constructor() {}

    /**
     * 从URL加载并创建Sprite
     * @param url 图片URL
     * @param options Sprite配置选项
     * @returns Promise<Sprite>
     */
    public async loadSprite(
        url: string,
        parent: Container,
        options: SpriteOptions = {},
        hash?: string
    ): Promise<Sprite> {
        try {
            // v8中的纹理加载方式
            const texture = await Assets.load(url);

            const sprite = Sprite.from(texture);
            sprite.metadata = {
                url: url,
                hash: hash || '',
                serverUrl: '',
            };

            this.applySpriteOptions(sprite, options);
            parent.addChild(sprite);

            sprite.metadata = {
                hash: hash || '',
            };

            return sprite;
        } catch (error) {
            console.error('加载Sprite失败:', error);
            throw error;
        }
    }

    /**
     * 应用Sprite配置选项
     */
    private applySpriteOptions(sprite: Sprite, options: SpriteOptions): void {
        const {
            x = 0,
            y = 0,
            width,
            height,
            anchor = { x: 0, y: 0 },
            scale = { x: 1, y: 1 },
            alpha = 1,
            interactive = false,
        } = options;

        sprite.position.set(x, y);
        sprite.anchor.set(anchor.x, anchor.y);
        sprite.scale.set(scale.x, scale.y);
        sprite.alpha = alpha;

        // v8中的交互性设置
        sprite.eventMode = interactive ? 'static' : 'none';
        sprite.cursor = interactive ? 'pointer' : 'default';

        if (width !== undefined) sprite.width = width;
        if (height !== undefined) sprite.height = height;
    }

    /**
     * 移除Sprite
     */
    public removeSprite(sprite: Sprite): void {
        if (sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
        sprite.destroy({ children: true, texture: true });
    }

    async loadMultipleSprites(
        spriteConfigs: Array<{
            url: string;
            parent: Container;
            options?: SpriteOptions;
            hash?: string;
        }>
    ) {
        const sprites = await Promise.all(
            spriteConfigs.map(config =>
                this.loadSprite(
                    config.url,
                    config.parent,
                    config.options,
                    config.hash
                )
            )
        );
        return sprites;
    }
}

export const spriteLoader = new SpriteLoader();
