import { Matrix, PointData, Sprite, Text } from 'pixi.js';

export function changeAnchor(
    sprite: Sprite | Text,
    anchor: { x: number; y: number }
): void {
    const currentAnchor = sprite.anchor;
    const deltaAnchorX = anchor.x - currentAnchor.x;
    const deltaAnchorY = anchor.y - currentAnchor.y;
    const realWidth = sprite.width / sprite.scale.x;
    const realHeight = sprite.height / sprite.scale.y;
    const localPos = {
        x: deltaAnchorX * realWidth,
        y: deltaAnchorY * realHeight,
    };
    const posInParent = sprite.localTransform.apply(localPos);
    sprite.anchor.set(anchor.x, anchor.y);
    sprite.x = posInParent.x;
    sprite.y = posInParent.y;
}

export function computeMatrixByPos(
    targetPos: Readonly<PointData[]>,
    sourcePos: Readonly<PointData[]>,
    angle: number
): Matrix {
    const targetWidth = Math.hypot(
        targetPos[0].x - targetPos[1].x,
        targetPos[0].y - targetPos[1].y
    );
    const targetHeight = Math.hypot(
        targetPos[0].x - targetPos[3].x,
        targetPos[0].y - targetPos[3].y
    );

    const width = Math.hypot(
        sourcePos[0].x - sourcePos[1].x,
        sourcePos[0].y - sourcePos[1].y
    );

    const height = Math.hypot(
        sourcePos[0].x - sourcePos[3].x,
        sourcePos[0].y - sourcePos[3].y
    );

    const sx = targetWidth / width;
    const sy = targetHeight / height;

    const x_ = targetPos[0].x;
    const y_ = targetPos[0].y;
    const x = sourcePos[0].x;
    const y = sourcePos[0].y;
    const rad = angle * (Math.PI / 180);
    const tx = x_ - Math.cos(rad) * sx * x + Math.sin(rad) * sy * y;
    const ty = y_ - Math.sin(rad) * sx * x - Math.cos(rad) * sy * y;

    const matrix = new Matrix().identity();
    matrix.rotate(angle);
    matrix.scale(sx, sy);
    matrix.translate(tx, ty);

    return matrix;
}

export function getNodeLocalRectPoints(node: Sprite | Text): PointData[] {
    // lt, rt, rb, lb
    return [
        { x: -node.width * node.anchor.x, y: -node.height * node.anchor.y },
        {
            x: node.width * (1 - node.anchor.x),
            y: -node.height * node.anchor.y,
        },
        {
            x: node.width * (1 - node.anchor.x),
            y: node.height * (1 - node.anchor.y),
        },
        {
            x: -node.width * node.anchor.x,
            y: node.height * (1 - node.anchor.y),
        },
    ];
}

export function getNodeRectPointsInParent(node: Sprite | Text): PointData[] {
    const matrix = node.localTransform;
    return getNodeLocalRectPoints(node).map(point => {
        return matrix.apply(point);
    });
}
