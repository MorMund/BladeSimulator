import { AnimatedSprite, Container, Spritesheet, Point, Sprite } from "pixi.js";
import { toFullLoopAnim, getCenter } from "./utils";
import { Entity } from "./Entity";
import { Projectile } from "./Projectile";
import * as fireballPath from "../assets/fireball.png";

export enum Movement {
    "None" = 0,
    "Forward" = 1,
    "Backward" = 2,
    "Left" = 4,
    "Right" = 8
}

interface Spell {
    name: SpellName;
    castTime: number;
    damage: number;
    damageVariance: number;
    cooldown: number;
}

type SpellName = "Fireball" | "Pyroblast" | "Scorch" | "Fire Blast" | "Blink";

const maxHP = 2000;

export class Gnome extends Entity {
    private animations = new Map<string, AnimatedSprite>();
    private container: Container;
    private movement: Movement = Movement.None;
    private currentCast: { spell: SpellName, castTime: number } = null;
    private spells: Map<SpellName, Spell>;
    private cooldowns = new Map<SpellName, number>();
    private globalCooldown = 1;
    private currentGC = 0;
    private target: Entity;
    private addEntity: (entity: Entity) => void;
    private fireballSprite: Sprite;

    private health = maxHP;
    private rotationSpeed = 5;
    private movementSpeed = 2;
    private blinkRange = 50;
    private critChange = 0.2;

    constructor(spritesheet: Spritesheet, addEntity: (entity: Entity) => void) {
        super();
        this.addEntity = addEntity;

        this.container = new Container();
        this.container.scale = new Point(0.2, 0.2);

        const walk = toFullLoopAnim(spritesheet.animations.walk);
        const backpedal = toFullLoopAnim(spritesheet.animations.walk_b);
        const cast = toFullLoopAnim(spritesheet.animations.cast);

        this.animations.set("walk", walk);
        this.animations.set("backpedal", backpedal);
        this.animations.set("cast", cast);
        this.animations.set("cast_i", new AnimatedSprite(spritesheet.animations.cast_i));
        this.animations.set("idle", new AnimatedSprite(spritesheet.animations.idle));
        this.animations.forEach(element => {
            element.anchor.set(0.5);
            element.animationSpeed = 0.1;
            element.visible = false;
            element.play();
            this.container.addChild(element);
        });

        this.selectAnimation("idle");

        const spellList: Array<Spell> = [
            { name: "Fireball", castTime: 2, damage: 5000, damageVariance: 500, cooldown: 0 },
            { name: "Blink", castTime: 0, damage: 0, damageVariance: 0, cooldown: 15 },
            { name: "Fire Blast", castTime: 0, damage: 700, damageVariance: 300, cooldown: 8 },
            { name: "Scorch", castTime: 1.5, damage: 700, damageVariance: 300, cooldown: 0 },
            { name: "Pyroblast", castTime: 6, damage: 1500, damageVariance: 500, cooldown: 0 }
        ];

        this.spells = new Map<SpellName, Spell>(spellList.map((spell) => [spell.name, spell]));

        this.fireballSprite = Sprite.from(fireballPath.default);
        this.fireballSprite.scale.set(0.2);
    }

    public move(direction: Movement): void {
        this.movement = direction;
    }

    public cast(spellName: SpellName): Boolean {
        if(!!this.currentCast) {
            return;
        }

        let isSuccessful = true;
        if (this.currentGC !== 0) {
            isSuccessful = false;
        } else if (this.cooldowns.has(spellName)) {
            isSuccessful = this.cooldowns.get(spellName) === 0;
        }

        if (isSuccessful) {
            this.currentCast = { spell: spellName, castTime: this.spells.get(spellName).castTime };
        }

        return isSuccessful;
    }

    private selectAnimation(animation: string) {
        this.animations.forEach((animEntry, name) => animEntry.visible = (name === animation));
    }

    public getContainer(): Container {
        return this.container;
    }

    public setTarget(target: Entity): void {
        this.target = target;
    }

    public damage(damage: number): void {
        this.health -= damage;
        console.log("Player Health: " + this.health);
    }

    public getHealth(): number {
        return this.health;
    }

    public getMaxHealth(): number {
        return maxHP;
    }

    public getCooldowns(): Map<SpellName, number> {
        return this.cooldowns;
    }

    public getCurrentCast(): {name: SpellName, castTime: number, spellCastTime: number} {
        if(!this.currentCast) {
            return undefined;
        }

        const spellcastTime = this.spells.get(this.currentCast.spell).castTime;
        return {
            name: this.currentCast.spell,
            castTime: spellcastTime - this.currentCast.castTime,
            spellCastTime: spellcastTime
        };
    }

    public update(delta: number, deltaS: number): void {
        this.currentGC = Math.max(0, this.currentGC - deltaS);
        if (this.currentCast !== null) {
            const cast = this.currentCast;
            const spell = this.spells.get(cast.spell);
            cast.castTime = Math.max(0, cast.castTime - deltaS);
            if (cast.castTime === 0) {
                this.currentCast = null;
                const variance = (Math.random() - 0.5) * 2;
                const critMultiply = (Math.random() < this.critChange) ? 2 : 1;
                const castDamage = spell.damage + variance * spell.damageVariance * critMultiply;
                if (spell.name === "Blink") {
                    this.moveInDirection(100, 1);
                } else if (spell.name === "Fireball" || spell.name === "Pyroblast") {
                    this.addEntity(new Projectile({
                        target: this.target,
                        damage: castDamage,
                        origin: getCenter(this.container.getBounds()),
                        speed: 3,
                        sprite: this.fireballSprite
                    }
                    ));
                } else if(spell.name === "Scorch" || spell.name === "Fire Blast") {
                    this.target.damage(castDamage);
                }

                this.cooldowns.set(spell.name, spell.cooldown);
            }
        }

        if (this.movement !== Movement.None) {
            this.currentCast = null;
        }

        if ((this.movement & Movement.Left) === Movement.Left) {
            this.container.angle -= this.rotationSpeed;
        }

        if ((this.movement & Movement.Right) === Movement.Right) {
            this.container.angle += this.rotationSpeed;
        }
        let movementDirection = 0;

        if ((this.movement & Movement.Forward) === Movement.Forward) {
            movementDirection = 1;
        }

        if ((this.movement & Movement.Backward) === Movement.Backward) {
            movementDirection = -0.3;
        }

        this.moveInDirection(this.movementSpeed * movementDirection, delta);

        if (this.currentCast !== null) {
            this.selectAnimation("cast");
        } else if (movementDirection > 0) {
            this.selectAnimation("walk");
        } else if (movementDirection < 0) {
            this.selectAnimation("backpedal");
        } else {
            this.selectAnimation("idle");
        }

        this.cooldowns.forEach((val, spellName) => {
            this.cooldowns.set(spellName, val - deltaS);
            if (this.cooldowns.get(spellName) <= 0) {
                this.cooldowns.delete(spellName);
            }
        });
    }
}