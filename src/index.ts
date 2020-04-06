import * as img from "../assets/test.png";
import * as background from "../assets/background.png";
import * as data from "../assets/princess.json";
import * as princessSheet from "../assets/princess.png";
import { Princess } from "./Princess";
import { Application, Spritesheet, Sprite } from "pixi.js";

const app = new Application({ width: 800, height: 800, backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

let princess: Princess;
app.loader
  .add("image",princessSheet.default)
  .load((loader, resources) => {
    const sheet = new Spritesheet(resources.image.texture.baseTexture, data);
    sheet.parse(() => {
        princess = new Princess(sheet);
        princess.addToStage(app.stage);
    });
});

const bg = Sprite.from(background.default);
bg.width = app.screen.width;
bg.height = app.screen.height;
const target = Sprite.from(img.default);
target.width = 20;
target.height = 20;
target.x = 300;
target.y = 200;

app.stage.addChild(bg);
app.stage.addChild(target);

app.ticker.add((delta) => {
    if(princess !== undefined) {
        princess.setTarget(target);
        princess.update();
    }
});

document.addEventListener("keydown", (ev) => {
    ev.preventDefault();
    const speed = 10;
    if(ev.key === "ArrowUp") {
        target.y += speed;
    } else if(ev.key === "ArrowDown") {
        target.y -= speed;
    }  else if(ev.key === "ArrowLeft") {
        target.x -= speed;
    } else if(ev.key === "ArrowRight") {
        target.x += speed;
    }
})
