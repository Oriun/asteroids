import ndArray, { NdArray, Data } from "ndarray";
import { Game } from ".";
import { SerializedGameElement } from "../elements/base";
import { Laser } from "../elements/laser";
import { bound, formatNumber, PngSaver, Timer } from "../utils";
import { StaticPool } from "node-worker-threads-pool";
import ndarray from "ndarray";
import OS from "os";

type Coordinate = [number, number];

console.log("OS.cpus().length = ", OS.cpus().length);
export const workerPool = new StaticPool({ size: OS.cpus().length, task: "./dist/games/traceWorker.js" });

export class Trace {
  traceGamma = 0.9;
  asteroids: Coordinate[][] = [];
  playerSpecific: Record<string, Coordinate[][]> = {};
  game: Game;
  static cachedDrawings: Record<string, Coordinate[]> = {};

  constructor(game: Game) {
    this.game = game;
  }
  get length() {
    return this.asteroids.length;
  }
  buf(data?: Data<number>) {
    return ndArray(data ?? new Uint8Array(this.game.width * this.game.height), [this.game.width, this.game.height]);
  }
  push(data: SerializedGameElement[]) {
    this.asteroids.push([]);
    this.game.players.forEach((id) => {
      this.playerSpecific[id] ??= [];
      this.playerSpecific[id].push([]);
    });
    for (const element of data) {
      const [key, func] =
        element.type === "player"
          ? [element.rotation + "deg", Trace.drawPlayer]
          : [element.width + "px", Trace.drawPlain];
      let pos = Trace.cachedDrawings[key];
      if (!pos) {
        pos = func(element.width, element.rotation, this.game.height);
        Trace.cachedDrawings[key] = pos;
      }
      switch (element.type) {
        case "asteroid": {
          for (const [x, y] of pos) {
            const px = x + element.x;
            const py = y + element.y;
            if (px < 0 || py < 0 || px >= this.game.width || py >= this.game.height) {
              continue;
            }
            this.asteroids.at(-1)!.push([px, py]);
          }
          break;
        }
        case "player": {
          this.game.players.forEach((id) => {
            if (id !== element.id) return;
            for (const [x, y] of pos) {
              const px = x + element.x;
              const py = y + element.y;
              if (px < 0 || py < 0 || px >= this.game.width || py >= this.game.height) continue;
              this.playerSpecific[id].at(-1)!.push([px, py]);
            }
          });
        }
        case "laser": {
          this.game.players.forEach((id) => {
            if (id === (element as Laser).origin) return;
            for (const [x, y] of pos) {
              const px = x + element.x;
              const py = y + element.y;
              if (px < 0 || py < 0 || px >= this.game.width || py >= this.game.height) continue;
              this.playerSpecific[id].at(-1)!.push([px, py]);
            }
          });
        }
      }
    }
  }
  static drawPlain(width: number, _: number, gameHeight: number) {
    const pos: Coordinate[] = [];
    const center = Math.floor(width / 2);
    for (let i = width + 1; i >= 0; i--) {
      let j = 0;
      horizontal: while (true) {
        const x = j;
        const y = i - center;
        const dist = Math.sqrt(x ** 2 + y ** 2);
        if (dist > width / 2) {
          break horizontal;
        }
        pos.push([center - j, i]);
        j && pos.push([center + j, i]);
        j++;
      }
    }
    return pos;
  }
  static drawPlayer(width: number, rotation: number, gameHeight: number) {
    const pos: Coordinate[] = [];
    const center = Math.floor(width / 2);

    // 1. Draw a circle representing the player boundaries
    for (let i = width + 1; i >= 0; i--) {
      let j = 0;
      horizontal: while (true) {
        const dist = Math.sqrt(j ** 2 + (i - center) ** 2);
        if (dist > width / 2) {
          j--;
          pos.push([center - j - 1, i - 1]);
          pos.push([center - j, i]);
          pos.push([center + j, i]);
          pos.push([center + j + 1, i + 1]);
          break horizontal;
        }
        j++;
      }
    }

    // 2. Draw a line (ray of the circle) representing the player's direction
    let i = 0,
      j = 0;
    direction: while (true) {
      const dist = Math.sqrt(i ** 2 + j ** 2);
      if (dist > width / 2) {
        break direction;
      }
      const y = center + j;
      pos.push([center + i, y]);
      pos.push([center + i - 1, y]);
      pos.push([center + i + 1, y]);
      //update i and j based on rotation
      const radians = (rotation * Math.PI) / 180;
      i += Math.cos(radians);
      j += Math.sin(radians);
    }
    return pos;
  }
  exportOneFrame(player: string, index: number, length: number): NdArray {
    const asteroidSlice = this.asteroids.slice(index - length, index);
    const playerSlice = this.playerSpecific[player].slice(index - length, index);

    const buf = ndarray(new Uint8Array(this.game.width * this.game.height), [this.game.width, this.game.height]);
    for (let j = 0; j < asteroidSlice.length; j++) {
      const value = Math.floor(255 * Math.pow(this.traceGamma, length - j - 1));
      for (const [x, y] of asteroidSlice[j]) {
        buf.set(Math.floor(x), Math.floor(this.game.height - y), value);
      }
      for (const [x, y] of playerSlice[j]) {
        buf.set(Math.floor(x), Math.floor(this.game.height - y), value);
      }
    }
    return buf;
  }
  export(player: string, length: number = 5) {
    if (!this.length) return null;
    return Promise.all(
      Array.from({ length: this.length - length }, (_, i) => {
        return this.exportOneFrame(player, i + length, length);
      })
    );
  }
  async save() {
    const t = new Timer();
    let totalDuration = 0;

    player: for (const player of this.game.players) {
      const exportData = await this.export(player, 30);
      if (!exportData) {
        continue player;
      }
      const saveTimer = new Timer();
      await Promise.all(
        exportData.map((buf, i) => {
          const filename = `trace/${Game.creationTime}/${this.game.id}/${player}/${i}`;
          return workerPool.exec({
            type: "save",
            data: { buf, filename },
          });
        })
      );
      totalDuration += saveTimer.elapsed();
    }

    const end = t.elapsed();
    console.log(`Png saved in ${formatNumber(totalDuration)} nanoseconds`);
    console.log(`Trace saved in ${formatNumber(end)} nanoseconds`);
  }
}
