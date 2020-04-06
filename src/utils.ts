import { AnimatedSprite, Rectangle, Point } from "pixi.js";

export function toFullLoopAnim(animation: Array<any>): AnimatedSprite {
    const loopBack = animation.slice(1, animation.length - 2);
    return new AnimatedSprite(animation.concat(loopBack));
}

export function getDistance(p1: Point, p2: Point): number {
    const distX = p1.x - p2.x;
    const distY = p1.y - p2.y;
    return Math.sqrt((distX * distX) + (distY * distY));
}

export function getAngleBetweenPoints2(x1: number, x2: number, y1: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function getAngleBetweenPoints(p1: Point, p2: Point): number {
    return getAngleBetweenPoints2(p1.x, p2.x, p1.y, p2.y);
}

export function getCenter(rect: Rectangle): Point {
    return new Point(
        rect.x + (rect.width / 2),
        rect.y + (rect.height / 2));
}

export function normalizeAngle(angle: number): number {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}
