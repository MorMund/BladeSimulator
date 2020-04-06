import { Container, Point } from "pixi.js";

export abstract class Entity {
    private onDeath = new Set<(entity: Entity) => void>();

    abstract getContainer(): Container;
    abstract update(delta: number, deltaS: number): void;
    abstract damage(damage: number): void;

    public addOnDeathListener(handler: (entity: Entity) => void): void {
        this.onDeath.add(handler);
    }
    public kill(): void {
        if(this.onDeath !== undefined) {
            this.onDeath.forEach((handler) => handler(this));
        }

        this.onDeath = null;
    }

    protected moveInDirection(distance: number, delta: number): void {
        const directionX = Math.cos(this.getContainer().rotation);
        const directionY = Math.sin(this.getContainer().rotation);

        const deltaX = directionX * -distance * delta;
        const deltaY = directionY * -distance * delta;

        const posX = this.getContainer().x;
        const posY = this.getContainer().y;

        this.getContainer().position.x = posX + deltaX;
        this.getContainer().position.y = posY + deltaY;
    }

    // for restricting movement in arena
    public forceMove(center: Point, distance: number, angle: number): void {
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);

        const deltaX = directionX * -distance;
        const deltaY = directionY * -distance;

        this.getContainer().position.x = center.x + deltaX;
        this.getContainer().position.y = center.y + deltaY;
    }
}