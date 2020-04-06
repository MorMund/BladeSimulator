import { Spritesheet, AnimatedSprite, Container, Point } from "pixi.js";
import { toFullLoopAnim, getCenter, getAngleBetweenPoints, getDistance } from "./utils";
import { Entity } from "./Entity";
import { DamageText } from "./DamageText";


const maxHP = 10000;

export class Princess extends Entity {
    private animations = new Map<string, AnimatedSprite>();
    private container: Container;
    private target: Entity;
    private health = maxHP;
    private isAttacking = false;
    private movementSpeed = 1;
    private isDead = false;
    private wasAttacked = false;
    private addEntity: (entity: Entity) => void;

    private onLooted: () => void;

    constructor(spritesheet: Spritesheet, addEntity: (entity: Entity) => void) {
        super();
        this.addEntity = addEntity;
        this.container = new Container();
        this.container.scale = new Point(0.2, 0.2);
        this.animations.set("walk", toFullLoopAnim(spritesheet.animations.walk));
        this.animations.set("attack", toFullLoopAnim(spritesheet.animations.attack));
        this.animations.set("fart", new AnimatedSprite(spritesheet.animations.fart));
        this.animations.set("idle", new AnimatedSprite(spritesheet.animations.idle));
        this.animations.set("death", new AnimatedSprite(spritesheet.animations.death));
        this.animations.forEach(element => {
            element.animationSpeed = 0.05;
            element.anchor.set(0.5);
            element.visible = false;
            element.play();
            this.container.addChild(element);
        });

        this.selectAnimation("idle");
        this.animations.get("death").loop = false;
        const attack = this.animations.get("attack")
        attack.stop();
        attack.onLoop = () => {
            this.isAttacking = false;
            const attackAnim = this.animations.get("attack");
            attackAnim.stop();
            this.target.damage(300 + (Math.random() * 200), false);
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

    public setOnLooted(callback: () => void): void {
        this.onLooted = callback;
    }

    public damage(damage: number, isCrit: boolean): void {
        this.addEntity(new DamageText(this, true, damage, isCrit));
        this.wasAttacked = true;
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            this.health = 0;
            this.selectAnimation("death");

            this.container.buttonMode = true;
            this.container.interactive = true;
            this.container.on("pointerdown", () => {
                this.container.buttonMode = false;
                this.container.interactive = false;
                this.onLooted();
                this.kill();
            });
        }
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return maxHP;
    }

    public update(delta: number): void {
        if (this.isDead || !this.wasAttacked) {
            return;
        }

        if (this.target !== undefined && !this.isAttacking) {
            this.selectAnimation("walk");
            const targetCenter = getCenter(this.target.getContainer().getBounds());
            const selfCenter = getCenter(this.container.getBounds());

            const distance = getDistance(selfCenter, targetCenter);

            this.container.rotation = getAngleBetweenPoints(targetCenter, selfCenter);
            if (distance > 50) {
                this.moveInDirection(this.movementSpeed, delta);
            } else {
                this.isAttacking = true;
                const attackAnim = this.animations.get("attack");
                attackAnim.play();
                this.selectAnimation("attack");
            }
        }
    }
}