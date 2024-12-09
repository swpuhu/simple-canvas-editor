import { Application, Container } from 'pixi.js';
import { AbstractPlugin } from './plugins/AbstractPlugin';
import { CanvasLayers } from './types';

export class PluginManager {
    private plugins: AbstractPlugin[] = [];

    constructor(private app: Application, private layers: CanvasLayers) {}

    public usePlugin<T extends AbstractPlugin>(pluginClass: new () => T): T {
        const plugin = new pluginClass();
        this.plugins.push(plugin);
        this.activatePlugin(plugin);
        return plugin;
    }

    private activatePlugin(plugin: AbstractPlugin) {
        plugin.activate(this.app, this.layers);
    }

    public ready(): void {
        this.plugins.forEach(plugin => {
            plugin.onLoad();
        });
    }
}
