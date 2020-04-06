import { AnimatedSprite } from "pixi.js";

export function toFullLoopAnim(animation: Array<any>): AnimatedSprite {
    const loopBack = animation.slice(1, animation.length - 2);
    return new AnimatedSprite(animation.concat(loopBack));
}