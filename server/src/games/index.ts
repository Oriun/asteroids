import shortid from "shortid";
import { Asteroid } from "../elements/asteroid";
import type { SerializedGameElement, GameElement } from "../elements/base";
import { Player } from "../elements/player";
import { circleCollision } from "../utils";
import { Trace } from "./trace";

export class Game {
  creationTime = Date.now();
  players: string[];
  id: string;
  onStart?(game: Game): void;
  onStop?(game: Game): void;
  onSave?(game: Game): void;
  startWrite?(): void;
  onUpdate?(game: Game, data: SerializedGameElement[]): void;
  gameLoop: NodeJS.Timeout;
  frameRate = 1000 / 30;
  time = 0;
  elements: GameElement[] = [];
  width = 1000;
  height = 900;
  trace: Trace;
  stopped = false;

  constructor(...players: string[]) {
    this.id = shortid();
    this.players = players;
    this.gameLoop = 0 as unknown as NodeJS.Timeout;
    this.trace = new Trace(this);
  }
  clone() {
    const game = new Game(...this.players);
    game.creationTime = this.creationTime;
    game.frameRate = this.frameRate;
    game.time = this.time;
    game.elements = [...this.elements];
    game.width = this.width;
    game.height = this.height;
    game.stopped = this.stopped;
    game.id = this.id;
    return game;
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
  start() {
    console.log("game started");
    this.onStart?.(this);
    let lastTime = Date.now();
    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const delay = now - lastTime;
      process.stdout.write("\r" + Math.floor(1000 / delay) + "fps");
      lastTime = now;
      this.time++;
      if (this.time % 25 === 0) {
        this.insert(Asteroid.fromEdge(this));
      }
      for (const element of this.elements) {
        element.live(this, delay);
        for (const other of this.elements) {
          if (other.id === element.id) continue;
          if (circleCollision(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, other.x + other.width / 2, other.y + other.height / 2, other.width / 2)) {
            element.collide(this, other);
          }
        }
      }
      const serialize = this.serialize();
      this.onUpdate?.(this, serialize);
      this.trace.push(serialize);
    }, this.frameRate);
  }
  async stop() {
    if (this.stopped) return;
    this.stopped = true;
    clearInterval(this.gameLoop);
    this.onStop?.(this);
    await this.trace.save();
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
    }, this.frameRate * 2);
    const shoot = setInterval(() => {
      if (player.dead) clearInterval(shoot);
      player.shoot();
    }, this.frameRate * 45);
    return player;
  }
}

export default Game;
