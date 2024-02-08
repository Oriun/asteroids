import shortid from "shortid";
import { Asteroid } from "../elements/asteroid";
import type { SerializedGameElement, GameElement } from "../elements/base";
import { Player } from "../elements/player";
import { circleCollision, formatNumber, PngSaver, Timer } from "../utils";
import { Trace, workerPool } from "./trace";

export class Game {
  static creationTime = Date.now();
  players: string[];
  id: string;
  onStart?(game: Game): void;
  onStop?(game: Game): void;
  onSave?(game: Game): void;
  startWrite?(): void;
  onUpdate?(game: Game, data: SerializedGameElement[]): void;
  gameLoop: NodeJS.Timeout;
  frameRate = 1000 / 15;
  noTimeout = true;
  time = 0;
  elements: GameElement[] = [];
  width = 1000;
  height = 900;
  trace: Trace;
  stopped = false;
  lastLoop = 0;
  timer: Timer | undefined;
  constructor(...players: string[]) {
    this.id = shortid();
    this.players = players;
    this.gameLoop = 0 as unknown as NodeJS.Timeout;
    this.trace = new Trace(this);
  }

  get center() {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }
  get playersAlive() {
    return this.elements.filter((element) => element.type === "player" && !element.dead);
  }
  async loop(useTimeout = false) {
    if (this.stopped) return;
    const now = Date.now();
    const delay = now - this.lastLoop;
    process.stdout.write("\r" + (1000 / delay).toFixed(0).padStart(3, " ") + "fps");
    this.lastLoop = now;
    this.time++;
    if (this.time % 25 === 0) {
      this.insert(Asteroid.fromEdge(this));
    }
    for (const element of this.elements) {
      element.live(this, 1000 / this.frameRate);
      for (const other of this.elements) {
        if (other.id === element.id) continue;
        if (
          circleCollision(
            element.x + element.width / 2,
            element.y + element.height / 2,
            element.width / 2,
            other.x + other.width / 2,
            other.y + other.height / 2,
            other.width / 2
          )
        ) {
          element.collide(this, other);
        }
      }
    }
    const serialize = this.serialize();
    this.onUpdate?.(this, serialize);
    this.trace.push(serialize);
    const player = this.players[0];
    const buf = await this.trace.exportOneFrame(player, -1, 1000 / this.frameRate);
    const filename = `trace/${Game.creationTime}/${this.id}/${player}/${this.time}`;
    await PngSaver.save(buf, filename);
    // await workerPool.exec({
    //   type: "save",
    //   data: { buf, filename },
    // });
    if (useTimeout) {
      const timeout = 1000 / this.frameRate - Date.now() + this.lastLoop;
      this.gameLoop = setTimeout(() => this.loop(true), this.noTimeout ? 0 : timeout);
    }
  }
  start() {
    this.timer = new Timer();
    console.log("game started");
    this.onStart?.(this);
    // let lastTime = Date.now();
    this.loop(true);
    // this.gameLoop = setInterval(() => {}, this.frameRate);
  }
  async stop() {
    if (this.stopped) return;
    const t = this.timer!.elapsed();
    console.log("Game stopped after ", formatNumber(t), "nanoseconds");
    this.stopped = true;
    clearInterval(this.gameLoop);
    this.onStop?.(this);
    // await this.trace.save();
    this.onSave?.(this);
  }
  remove(elementId: string) {
    this.elements = this.elements.filter((e) => e.id !== elementId);
  }
  serialize() {
    return this.elements.map((element) => element.serialize());
  }
  insert(element: GameElement) {
    this.elements.push(element);
  }
  newPlayer(playerId: string): Player {
    const pos = this.center;
    const player = new Player(playerId, pos.x, pos.y, 50, 50, 180, this);
    this.insert(player);
    const rotateInterval = setInterval(() => {
      if (player.dead) clearInterval(rotateInterval);
      player.rotate(true);
    }, this.frameRate);
    const speedUp = setInterval(() => {
      if (player.dead) clearInterval(speedUp);
      player.accelerate(true);
    }, this.frameRate);
    const shoot = setInterval(() => {
      if (player.dead) clearInterval(shoot);
      player.shoot();
    }, 2000);
    return player;
  }
}

export default Game;
