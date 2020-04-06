import { Entity } from "./Entity";
import { Container, Text, TextStyle, Point } from "pixi.js";

export class DamageText extends Entity {
    private text: Text;
    private lifetime = 2;
    private enemyStyle = new TextStyle({
        fill: "yellow",
        lineJoin: "round",
        strokeThickness: 2
    });
    private selfStyle = new TextStyle({
        fill: "#ffffff",
        lineJoin: "round",
        strokeThickness: 2
    });
    private critStyle = new TextStyle({
        fill: "yellow",
        fontSize: 34,
        fontWeight: "bolder",
        lineJoin: "round",
        strokeThickness: 2
    });

    constructor(origin: Entity, isEnemy: boolean, damage: number, isCrit: boolean) {
        super();
        if(!isCrit) {
        this.text = new Text(damage.toFixed(0), isEnemy ? this.enemyStyle : this.selfStyle);
        } else {
            this.text = new Text(damage.toFixed(0) + "!", this.critStyle);
        }
        const pos = new Point(origin.getContainer().position.x, origin.getContainer().position.y);
        pos.y -= 20 + (Math.random() * 60);
        pos.x -= 20 + (Math.random() * 60);
        this.text.position = pos;
    }

    getContainer(): Container {
        return this.text;
    }
    update(delta: number, deltaS: number): void {
        this.text.position.y -= delta * 0.2;
        this.lifetime -= deltaS;
        if(this.lifetime <= 0) {
            this.kill();
        }
    }
    damage(damage: number): void {
        throw new Error("Method not implemented.");
    }
}