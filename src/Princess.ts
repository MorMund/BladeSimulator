import { Spritesheet, AnimatedSprite, Container, Point, DisplayObject } from "pixi.js";
import { toFullLoopAnim } from "./utils";

export class Princess {
    private animations = new Map<string, AnimatedSprite>();
    private container: Container;
    private target: DisplayObject;

    constructor(spritesheet: Spritesheet) {
        this.container = new Container();
        this.container.scale = new Point(0.2, 0.2);
        const walk = this.completeWalkCycle(spritesheet.animations.walk);
        this.animations.set("walk",  walk);
        this.animations.set("fart", new AnimatedSprite(spritesheet.animations.fart));
        this.animations.set("idle", new AnimatedSprite(spritesheet.animations.idle));
        this.animations.forEach(element => {
            element.visible = false;
            element.play();
            this.container.addChild(element);
        });

        walk.animationSpeed = 0.05;
        walk.visible = true;
    }

    public addToStage(stage: Container): void {
        stage.addChild(this.container);
    }

    public setTarget(target: DisplayObject): void {
        this.target = target;
    }

    public update(): void {
        const deltaX = this.target.x - this.container.x;
        const deltaY = this.target.y - this.container.y;

        this.container.x += Math.max(Math.min(deltaX, 1), -1);
        this.container.y += Math.max(Math.min(deltaY, 1), -1);
    }

    private completeWalkCycle(walkAnim: any): any {
       return toFullLoopAnim(walkAnim);
    }
}