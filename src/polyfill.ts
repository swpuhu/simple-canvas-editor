import { Point } from 'pixi.js';

Point.prototype.subtract = function (point: Point): Point {
    return new Point(this.x - point.x, this.y - point.y);
};

Point.prototype.add = function (point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
};

Point.prototype.dot = function (other: Point): number {
    return this.x * other.x + this.y * other.y;
};

Point.prototype.cross = function (other: Point): number {
    return this.x * other.y - this.y * other.x;
};
