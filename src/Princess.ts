import { Spritesheet, AnimatedSprite, Container, Point } from "pixi.js";
import { toFullLoopAnim, getCenter, getAngleBetweenPoints } from "./utils";
import { Entity } from "./Entity";


const maxHP = 5000;

export class Princess extends Entity {
    private animations = new Map<string, AnimatedSprite>();
    private container: Container;
    private target: Entity;
    private health = maxHP;
    private isAttacking = false;
    private movementSpeed = 1;

    constructor(spritesheet: Spritesheet) {
        super();
        this.container = new Container();
        this.container.scale = new Point(0.2, 0.2);
        this.animations.set("walk",  toFullLoopAnim(spritesheet.animations.walk));
        this.animations.set("attack", toFullLoopAnim(spritesheet.animations.attack));
        this.animations.set("fart", new AnimatedSprite(spritesheet.animations.fart));
        this.animations.set("idle", new AnimatedSprite(spritesheet.animations.idle));
        this.animations.set("death",  new AnimatedSprite(spritesheet.animations.death));
        this.animations.forEach(element => {
            element.animationSpeed = 0.05;
            element.anchor.set(0.5);
            element.visible = false;
            element.play();
            this.container.addChild(element);
        });

        this.selectAnimation("walk");
        this.animations.get("attack").onLoop = () => {
            this.isAttacking = false;
            const attackAnim =  this.animations.get("attack");
            attackAnim.stop();
            this.target.damage(300);
        };
    }

    public getContainer(): Container {
        return this.container;
    }

    private selectAnimation(animation: string) {
        this.animations.forEach((animEntry, name) => animEntry.visible = (name === animation));
    }

    public setTarget(target: Entity): void {
        this.target = target;
    }

    public damage(damage: number): void {
        this.health -= damage;
        console.log("Boss Health: " + this.health);
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return maxHP;
    }

    public update(delta: number): void {
        if(this.target !== undefined && !this.isAttacking) {
            this.selectAnimation("walk");
            const targetCenter = getCenter(this.target.getContainer().getBounds());
            const selfCenter = getCenter(this.container.getBounds());

            const distX = selfCenter.x - targetCenter.x;
            const distY = selfCenter.y - targetCenter.y;
            const distance = Math.sqrt((distX * distX) + (distY * distY));

            this.container.rotation = getAngleBetweenPoints(targetCenter, selfCenter);
            if(distance > 50) {
                this.moveInDirection(this.movementSpeed, delta);
            } else {
                this.isAttacking = true;
                const attackAnim =  this.animations.get("attack");
                attackAnim.play();
                this.selectAnimation("attack");
            }
        }
    }
}