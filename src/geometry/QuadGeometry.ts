import { Geometry } from 'pixi.js';
import { AbstractGeo } from './AbstractGeo';

export class QuadGeometry extends AbstractGeo {
    private _geo: Geometry;

    get geo(): Geometry {
        return this._geo;
    }

    constructor(private width: number, private height: number) {
        super();
        this._geo = new Geometry({
            attributes: {
                aPosition: this.getPositions(),
                aUV: this.getUVs(),
            },
            indexBuffer: this.getIndices(),
        });
    }

    protected getPositions(): number[] {
        return [
            -this.width / 2,
            -this.height / 2,
            this.width / 2,
            -this.height / 2,
            this.width / 2,
            this.height / 2,
            -this.width / 2,
            this.height / 2,
        ];
    }

    protected getUVs(): number[] {
        return [0, 0, 1, 0, 1, 1, 0, 1];
    }

    protected getIndices(): number[] {
        return [0, 1, 2, 0, 2, 3];
    }
}
