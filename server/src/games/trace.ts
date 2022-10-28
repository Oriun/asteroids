import ndArray, { NdArray, Data } from "ndarray";
import type { Game } from ".";
import { SerializedGameElement } from "../elements/base";
import { Laser } from "../elements/laser";
import { bound, formatNumber, PngSaver, Timer } from "../utils";
import { StaticPool } from "node-worker-threads-pool";

type Coordinate = [number, number];

export class Trace {
  traceGamma = 0.75;
  asteroids: Coordinate[][] = [];
  playerSpecific: Record<string, Coordinate[][]> = {};
  game: Game;
  static cachedDrawings: Record<string, Coordinate[]> = {};

  constructor(game: Game) {
    this.game = game;
  }
  clone() {
    const clonedGame = this.game.clone();
    clonedGame.trace.traceGamma = this.traceGamma;
    clonedGame.trace.asteroids = this.asteroids;
    clonedGame.trace.playerSpecific = this.playerSpecific;
    return clonedGame.trace;
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
      const [key, func] = element.type === "player" ? [element.rotation + "deg", Trace.drawPlayer] : [element.width + "px", Trace.drawPlain];
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
  exportOneFrame(player: string, index: number, length: number) {
    const asteroidSlice = this.asteroids.slice(index - length, index);
    const playerSlice = this.playerSpecific[player].slice(index - length, index);
    const buf = this.buf();
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
    const buffs = [] as NdArray[];
    for (let i = length; i < this.length; i++) {
      try {
        buffs.push(this.exportOneFrame(player, i, length));
      } catch (e) {
        console.log(e);
      }
    }
    return buffs;
  }
  async save() {
    const t = new Timer();
    let totalDuration = 0;

    // const worker = async ({ player, trace }: { player: string; trace: Trace }) => {
    //   console.log("inside worker");
    //   const exportData = await trace.export(player, 10);
    //   if (!exportData) {
    //     return;
    //   }
    //   const saveTimer = new Timer();
    //   await Promise.all(
    //     exportData.map((buf, i) => {
    //       const filename = `trace/${trace.game.creationTime}/${trace.game.id}/${player}/${i}`;
    //       return PngSaver.save(buf, filename);
    //     })
    //   );
    //   totalDuration += saveTimer.elapsed();
    // };
    // console.log("new pool");
    // const workerPool = new StaticPool({ size: 8, task: worker });
    // await Promise.all(this.game.players.map((player) => workerPool.exec({ player, trace: this.clone() })));
    // await workerPool.destroy();
    player: for (const player of this.game.players) {
      const exportData = await this.export(player, 10);
      if (!exportData) {
        continue player;
      }
      const saveTimer = new Timer();
      await Promise.all(
        exportData.map((buf, i) => {
          const filename = `trace/${this.game.creationTime}/${this.game.id}/${player}/${i}`;
          return PngSaver.save(buf, filename);
        })
      );
      totalDuration += saveTimer.elapsed();
    }

    const end = t.elapsed();
    console.log(`Png saved in ${formatNumber(totalDuration)} nanoseconds`);
    console.log(`Trace saved in ${formatNumber(end)} nanoseconds`);
  }
}
