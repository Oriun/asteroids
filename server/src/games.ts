import shortid from "shortid";
import { Asteroid } from "./elements/asteroid";
import type { SerializedGameElement, GameElement } from "./elements/base";
import { Player } from "./elements/player";
import { bound, circleCollision, finiteQueue, saveToPng } from "./utils";
import ndarray, { NdArray } from "ndarray";

export class Game {
  static creationTime = Date.now();
  players: string[];
  id: string;
  onStart?(game: Game): void;
  onStop?(game: Game): void;
  startWrite?(): void;
  onUpdate?(game: Game, data: SerializedGameElement[]): void;
  gameLoop: NodeJS.Timeout;
  frameRate = 1000 / 15;
  time = 0;
  elements: GameElement[] = [];
  width = 1000;
  height = 900;
  // traceObject: Trace
  trace: NdArray[];
  traceGamma = 0.75;
  traceRate = 15;
  stopped = false;
  writePromise: Promise<void>;

  constructor(...players: string[]) {
    this.id = shortid();
    this.players = players;
    setTimeout(() => {
      this.start();
    }, 1000);
    this.gameLoop = 0 as unknown as NodeJS.Timeout;
    this.trace = finiteQueue(this.traceRate);
    this.writePromise = new Promise((resolve) => {
      this.startWrite = resolve;
    });
  }
  get center() {
    return {
      x: this.width / 2,
      y: this.height / 2
    };
  }
  get playersAlive() {
    return this.elements.filter(
      (element) => element.type === "player" && !element.dead
    );
  }
  start() {
    console.log("game started");
    this.onStart?.(this);
    let lastTime = Date.now();
    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const delay = now - lastTime;
      console.log("Framerate: ", this.frameRate, "ms");
      console.log("Actual Delay: ", delay, "ms");
      lastTime = now;
      this.time++;
      if (this.time % 25 === 0) {
        this.insert(Asteroid.fromEdge(this));
      }
      for (const element of this.elements) {
        element.live(this, delay);
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
      const serialized = this.serialize();
      this.onUpdate?.(this, serialized);
      // if (!(this.time % 6))
      this.render()
        .then((result) => this.trace.push(result))
        .then(() => this.export(true));
    }, this.frameRate);
  }
  async export(write = false) {
    const start = process.hrtime();
    const buf = ndarray(new Uint8Array(this.width * this.height), [
      this.width,
      this.height
    ]);
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        const value = this.trace.reduce(
          (acc, buf, index) =>
            acc +
            buf.get(i, j) *
              Math.pow(this.traceGamma, this.trace.length - index - 1),
          0
        );
        buf.set(i, j, bound(value, 0, 255));
      }
    }
    const end = process.hrtime(start);
    console.log(`Export took ${end[0] * 1e9 + end[1]} nanoseconds`);
    const filename = `trace/${Game.creationTime}/${this.id}/${this.time}.trace`;
    write &&
      this.writePromise
        .then(() => saveToPng(buf, filename))
        .then(() => console.log("wrote to", filename));
    return buf;
  }
  async stop() {
    if (this.stopped) return;
    this.stopped = true;
    clearInterval(this.gameLoop);
    this.startWrite?.();
    this.onStop?.(this);
  }
  remove(elementId: string) {
    this.elements = this.elements.filter((e) => e.id !== elementId);
  }
  serialize() {
    return this.elements.map((element) => element.serialize(true));
  }
  insert(element: GameElement) {
    this.elements.push(element);
  }
  newPlayer(playerId: string): Player {
    const pos = this.center;
    const player = new Player(
      playerId,
      pos.x,
      pos.y,
      50,
      50,
      180,
      this,
      this.traceRate
    );
    this.insert(player);
    const rotateInterval = setInterval(() => {
      if (player.dead) clearInterval(rotateInterval);
      player.rotate(true);
    }, 1000 / 30);
    const speedUp = setInterval(() => {
      if (player.dead) clearInterval(speedUp);
      player.accelerate(true);
    }, 1000 / 60);
    const shoot = setInterval(() => {
      if (player.dead) clearInterval(shoot);
      player.shoot();
    }, 1000 / 1.8);
    return player;
  }
  async render() {
    const start = process.hrtime();
    const buf = ndarray(new Uint8Array(this.width * this.height), [
      this.width,
      this.height
    ]);
    for (const element of this.elements) {
      // if (element.type === "player") continue;
      element.draw.bind(element.serialize())(buf, this);
    }
    const end = process.hrtime(start);
    console.log(`Render took ${end[0] * 1e9 + end[1]} nanoseconds`);
    return buf;
  }
}

export default Game;
