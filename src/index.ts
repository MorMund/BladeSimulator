import * as background from "../assets/background.png";
import * as princessAnim from "../assets/princess.json";
import * as gnomeAnim from "../assets/gnome.json";
import * as princessSheet from "../assets/princess.png";
import * as gnomeSheet from "../assets/gnome.png";
import { Princess } from "./Princess";
import { Application, Spritesheet, Sprite, Point, Graphics } from "pixi.js";
import { Gnome, Movement } from "./Gnome";
import { Entity } from "./Entity";
import { getCenter, getDistance, getAngleBetweenPoints } from "./utils";

const app = new Application({ width: 800, height: 800, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const downKeys = new Set<String>();
const arenaCenter = new Point(380,400);
const arenaRadius = 350;

let princess: Princess;
let gnome: Gnome;
const entities = new Set<Entity>();

const playerHealthUI = {
    bar: document.getElementById("player-health-bar"),
    text: document.getElementById("player-health-text")
};

const enemyHealthUI = {
    bar: document.getElementById("enemy-health-bar"),
    text: document.getElementById("enemy-health-text")
};

const cooldowns = {
    blast: document.getElementById("blast-cooldown"),
    blink: document.getElementById("blink-cooldown"),
};

const castbar = {
    container: document.getElementById("cast-container"),
    bar: document.getElementById("cast-bar"),
    text: document.getElementById("cast-text")
};

const lootWindow = document.getElementById("loot-window");
const lootList= document.getElementById("loot-list");

const deathWindow = document.getElementById("death-window");

const lootTable = import("../assets/drops.json") as any as Promise<Array<{URL: string, drops: number, chance: number}>>;

const retrybuttons = document.getElementsByClassName("retry-button");
for (let index = 0; index < retrybuttons.length; index++) {
    const element = retrybuttons[index] as HTMLButtonElement;
    element.onclick = reset;
}

function entityDeath(entity: Entity): void {
    app.stage.removeChild(entity.getContainer());
    entities.delete(entity);
}

function addEntity(entity: Entity): void {
    entities.add(entity);
    app.stage.addChild(entity.getContainer());
    entity.addOnDeathListener(entityDeath);
}

let princessSheetRes: Spritesheet, gnomeSheetRes : Spritesheet;

app.loader
    .add("princess", princessSheet.default)
    .add("gnome", gnomeSheet.default)
    .load((loader, resources) => {
        princessSheetRes = new Spritesheet(resources.princess.texture.baseTexture, princessAnim);
        gnomeSheetRes = new Spritesheet(resources.gnome.texture.baseTexture, gnomeAnim);
        princessSheetRes.parse(() => {
            createPrincess();
        });
        gnomeSheetRes.parse(() => {
            createGnome();
        });
    });

const bg = Sprite.from(background.default);
bg.width = app.screen.width;
bg.height = app.screen.height;

app.stage.addChild(bg);

app.ticker.add((delta) => {
    if (gnome !== undefined) {
        if(gnome.getHealth() <= 0) {
            deathWindow.style.visibility = "";
            return;
        }

        let move = Movement.None;
        if (downKeys.has("ArrowUp")) {
            move |= Movement.Forward;
        }
        if (downKeys.has("ArrowDown")) {
            move |= Movement.Backward;
        }
        if (downKeys.has("ArrowLeft")) {
            move |= Movement.Left;
        }
        if (downKeys.has("ArrowRight")) {
            move |= Movement.Right;
        }
        gnome.move(move);

        playerHealthUI.bar.style.width = `${gnome.getHealth() / gnome.getMaxHealth() * 100}%`;
        playerHealthUI.text.innerHTML = `${gnome.getHealth().toFixed(0)}/${gnome.getMaxHealth()}`;
        const blinkCD = gnome.getCooldowns().get("Blink");
        const blastCD = gnome.getCooldowns().get("Fire Blast");
        cooldowns.blink.innerHTML = !!blinkCD ? blinkCD.toFixed(1) : "";
        cooldowns.blast.innerHTML = !!blastCD ? blastCD.toFixed(1) : "";
        const cast = gnome.getCurrentCast();
        if(cast === undefined || cast.spellCastTime === 0) {
            castbar.container.style.visibility = "hidden";
        } else {
            castbar.container.style.visibility = "";
            castbar.bar.style.width = `${cast.castTime / cast.spellCastTime * 100}%`;
            castbar.text.innerHTML = cast.name;
        }

        const gnomeCenter = getCenter(gnome.getContainer().getBounds());
        const distance = getDistance(gnomeCenter, arenaCenter);
        if(distance > arenaRadius) {
            const angle = getAngleBetweenPoints(gnomeCenter, arenaCenter);
            gnome.forceMove(arenaCenter, arenaRadius, angle);
        }
    }

    if (princess !== undefined) {
        enemyHealthUI.bar.style.width = `${princess.getHealth() / princess.getMaxHealth() * 100}%`;
        enemyHealthUI.text.innerHTML = `${princess.getHealth().toFixed(0)}/${princess.getMaxHealth()}`;
    }

    entities.forEach((entity) => entity.update(delta, app.ticker.deltaMS / 1000));

    if (princess !== undefined && gnome !== undefined) {
        princess.setTarget(gnome);
        gnome.setTarget(princess);
    }
});

setupUi();

document.addEventListener("keydown", (ev) => {
    if (ev.key.startsWith("Arrow")) {
        ev.preventDefault();
    }

    downKeys.add(ev.key);
});

document.addEventListener("keyup", (ev) => {
    if (ev.key.startsWith("Arrow")) {
        ev.preventDefault();
    }

    downKeys.delete(ev.key);
});

document.addEventListener("keypress", (ev) => {
    if (ev.key === "r") {
        gnome.cast("Blink");
    } else if (ev.key === "x") {
        gnome.cast("Pyroblast");
    } else if (ev.key === "q") {
        gnome.cast("Fireball");
    } else if (ev.key === "w") {
        gnome.cast("Scorch");
    } else if (ev.key === "e") {
        gnome.cast("Fire Blast");
    }
});

async function setupUi() {
    const playerFrame = import("../assets/ui/UI-TargetingFrame.png");
    const enemyFrame = import("../assets/ui/UI-TargetingFrame-Elite.png");
    const castbar = import("../assets/ui/UI-CastingBar-Border.png");
    const fireball = import("../assets/ui/spell_fire_flamebolt.jpg");
    const blink = import("../assets/ui/spell_arcane_blink.jpg");
    const fireblast = import("../assets/ui/spell_fire_fireball.jpg");
    const scorch = import("../assets/ui/spell_fire_soulburn.jpg");
    const pyro = import("../assets/ui/spell_fire_fireball02.jpg");
    (document.getElementById("player-frame") as HTMLImageElement).src = (await playerFrame).default;
    (document.getElementById("enemy-frame") as HTMLImageElement).src = (await enemyFrame).default;
    (document.getElementById("castbar-frame") as HTMLImageElement).src = (await castbar).default;
    (document.getElementById("fireball-action") as HTMLImageElement).src = (await fireball).default;
    (document.getElementById("blink-action") as HTMLImageElement).src = (await blink).default;
    (document.getElementById("pyro-action") as HTMLImageElement).src = (await pyro).default;
    (document.getElementById("scorch-action") as HTMLImageElement).src = (await scorch).default;
    (document.getElementById("fireblast-action") as HTMLImageElement).src = (await fireblast).default;
}

async function showLootWindow() {
    lootWindow.style.visibility = "";
    for (const item of await lootTable) {
        const dropRNG = Math.random();
        if(dropRNG < item.chance) {
            console.log(item);
            const element = document.createElement("a");
            element.className = "loot-item";
            element.href = item.URL;
            console.log(element);
            lootList.appendChild(element);
            // tslint:disable-next-line: no-eval
            eval("$WowheadPower.refreshLinks()");
        }
    }
}

function reset() {
    princess = undefined;
    gnome = undefined;
    entities.forEach((entity) => entity.kill());
    createPrincess();
    createGnome();
    lootList.innerHTML = "";
    lootWindow.style.visibility = "hidden";
    deathWindow.style.visibility = "hidden";
}

function createPrincess(): void {
    princess = new Princess(princessSheetRes, addEntity);
    addEntity(princess);
    princess.setOnLooted(showLootWindow);
    princess.getContainer().position = new Point(400,400);
}

function createGnome(): void {
    gnome = new Gnome(gnomeSheetRes, addEntity);
    addEntity(gnome);
    gnome.getContainer().position = new Point(600,200);
}
