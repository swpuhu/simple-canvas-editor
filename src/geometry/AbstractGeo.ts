export abstract class AbstractGeo {
    constructor() {}

    protected abstract getPositions(): number[];

    protected abstract getUVs(): number[];

    protected abstract getIndices(): number[];
}
