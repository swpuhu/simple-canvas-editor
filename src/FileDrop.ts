export interface FileDropOptions {
    accept?: string[]; // 接受的文件类型
    multiple?: boolean; // 是否允许多文件
    maxSize?: number; // 最大文件大小（字节）
    onDrop?: (urls: string[], event: DragEvent) => void; // 拖放成功回调
    onError?: (error: string) => void; // 错误回调
}

export class FileDrop {
    private element: HTMLElement;
    private options: FileDropOptions;
    private dragCounter: number = 0;

    constructor(element: HTMLElement, options: FileDropOptions = {}) {
        this.element = element;
        this.options = {
            accept: ['image/*'], // 默认接受所有图片
            multiple: false, // 默认单文件
            maxSize: 5 * 1024 * 1024, // 默认5MB
            ...options,
        };

        this.setupDropZone();
    }

    private setupDropZone() {
        // 添加拖放样式
        this.element.classList.add('file-drop-zone');

        // 阻止默认拖放行为
        this.element.addEventListener('dragover', e => {
            e.preventDefault();
            e.stopPropagation();
        });

        // 处理拖入事件
        this.element.addEventListener('dragenter', e => {
            e.preventDefault();
            e.stopPropagation();

            this.dragCounter++;
            this.element.classList.add('file-drop-active');
        });

        // 处理拖出事件
        this.element.addEventListener('dragleave', e => {
            e.preventDefault();
            e.stopPropagation();

            this.dragCounter--;
            if (this.dragCounter === 0) {
                this.element.classList.remove('file-drop-active');
            }
        });

        // 处理放置事件
        this.element.addEventListener('drop', e => {
            e.preventDefault();
            e.stopPropagation();

            this.dragCounter = 0;
            this.element.classList.remove('file-drop-active');

            const files = Array.from(e.dataTransfer?.files || []);
            this.handleFiles(files, e);
        });
    }

    private handleFiles(files: File[], event: DragEvent) {
        // 检查文件数量
        if (!this.options.multiple && files.length > 1) {
            this.options.onError?.('只允许上传单个文件');
            return;
        }

        // 验证文件
        const validFiles = files.filter(file => {
            // 检查文件类型
            const isValidType = this.options.accept?.some(type => {
                if (type.endsWith('/*')) {
                    const baseType = type.split('/')[0];
                    return file.type.startsWith(baseType);
                }
                return file.type === type;
            });

            if (!isValidType) {
                this.options.onError?.(`不支持的文件类型: ${file.type}`);
                return false;
            }

            // 检查文件大小
            if (file.size > (this.options.maxSize || Infinity)) {
                this.options.onError?.(`文件过大: ${file.name}`);
                return false;
            }

            return true;
        });

        // 转换为URL
        Promise.all(validFiles.map(file => this.fileToUrl(file)))
            .then(urls => {
                this.options.onDrop?.(urls, event);
            })
            .catch(error => {
                this.options.onError?.(error.message);
            });
    }

    private fileToUrl(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result as string);
            };

            reader.onerror = () => {
                reject(new Error(`文件读取失败: ${file.name}`));
            };

            reader.readAsDataURL(file);
        });
    }

    // 销毁实例，清理事件监听
    public destroy() {
        this.element.classList.remove('file-drop-zone', 'file-drop-active');
    }
}
