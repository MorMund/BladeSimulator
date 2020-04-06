import { Entity } from "./Entity";
import { Container, Sprite, Point } from "pixi.js";
import { getCenter, getAngleBetweenPoints } from "./utils";

export interface IProjectileInfo {
    target: Entity;
    damage: number;
    speed: number;
    sprite: Sprite;
    origin: Point;
    isCrit: boolean;
}

export class Projectile extends Entity {
    private sprite: Sprite;
    private target: Entity;
    private spellDamage: number;
    private speed: number;
    private isCrit: boolean;

    constructor(params: IProjectileInfo) {
        super();
        this.sprite = params.sprite;
        this.target = params.target;
        this.speed = params.speed;
        this.isCrit = params.isCrit;
        this.spellDamage = params.damage;
        this.sprite.anchor.set(0.5);
        this.sprite.x = params.origin.x;
        this.sprite.y = params.origin.y;
    }

    getContainer(): Container {
        return this.sprite;
    }

    damage(damage: number): void {
        throw new Error("Cannot damage a projectile");
    }

    update(delta: number, deltaS: number): void {
        const targetCenter = getCenter(this.target.getContainer().getBounds());
        const selfCenter = getCenter(this.sprite.getBounds());

        const distX = selfCenter.x - targetCenter.x;
        const distY = selfCenter.y - targetCenter.y;
        const distance = Math.sqrt((distX * distX) + (distY * distY));

        this.sprite.rotation = getAngleBetweenPoints(targetCenter, selfCenter);
        if(distance > 10) {
            this.moveInDirection(this.speed, delta);
        } else {
            this.target.damage(this.spellDamage, this.isCrit);
            this.kill();
        }
    }
}