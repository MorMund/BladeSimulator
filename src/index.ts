import * as img from "../assets/test.png";
import * as background from "../assets/background.png";
import * as princessAnim from "../assets/princess.json";
import * as gnomeAnim from "../assets/gnome.json";
import * as princessSheet from "../assets/princess.png";
import * as gnomeSheet from "../assets/gnome.png";
import { Princess } from "./Princess";
import { Application, Spritesheet, Sprite } from "pixi.js";
import { Gnome, Movement } from "./Gnome";
import { Entity } from "./Entity";

const app = new Application({ width: 800, height: 800, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const downKeys = new Set<String>();
let princess: Princess;
let gnome: Gnome;
const entities = new Set<Entity>();

function entityDeath(entity: Entity): void {
    app.stage.removeChild(entity.getContainer());
    entities.delete(entity);
}

function addEntity(entity: Entity): void {
    entities.add(entity);
    app.stage.addChild(entity.getContainer());
    entity.addOnDeathListener(entityDeath);
}

app.loader
  .add("princess",princessSheet.default)
  .add("gnome", gnomeSheet.default)
  .load((loader, resources) => {
    const princessSheet = new Spritesheet(resources.princess.texture.baseTexture, princessAnim);
    const gnomeSheet = new Spritesheet(resources.gnome.texture.baseTexture, gnomeAnim);
    princessSheet.parse(() => {
        princess = new Princess(princessSheet);
        addEntity(princess);
    });
    gnomeSheet.parse(() => {
        gnome = new Gnome(gnomeSheet, addEntity);
        addEntity(gnome);
    });
});

const bg = Sprite.from(background.default);
bg.width = app.screen.width;
bg.height = app.screen.height;

app.stage.addChild(bg);

app.ticker.add((delta) => {


    if(gnome !== undefined) {
        let move = Movement.None;
        if(downKeys.has("ArrowUp")) {
            move |= Movement.Forward;
        }
        if(downKeys.has("ArrowDown")) {
            move |= Movement.Backward;
        }
        if(downKeys.has("ArrowLeft")) {
            move |= Movement.Left;
        }
        if(downKeys.has("ArrowRight")) {
            move |= Movement.Right;
        }
        gnome.move(move);
    }

    entities.forEach((entity) => entity.update(delta, app.ticker.deltaMS / 1000));

    if(princess !== undefined && gnome !== undefined) {
        princess.setTarget(gnome);
        gnome.setTarget(princess);
    }
});

document.addEventListener("keydown", (ev) => {
    if(ev.key.startsWith("Arrow")) {
        ev.preventDefault();
    }

    downKeys.add(ev.key);
});

document.addEventListener("keyup", (ev) => {
    if(ev.key.startsWith("Arrow")) {
        ev.preventDefault();
    }

    downKeys.delete(ev.key);
});

document.addEventListener("keypress", (ev) => {
    if(ev.key === "r") {
        gnome.cast("Blink");
    } else if(ev.key === "x") {
        gnome.cast("Pyroblast");
    } else if(ev.key === "q") {
        gnome.cast("Fireball");
    }
});
