"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trace = void 0;
const ndarray_1 = __importDefault(require("ndarray"));
const utils_1 = require("../utils");
class Trace {
    constructor(game) {
        this.traceGamma = 0.75;
        this.asteroids = [];
        this.playerSpecific = {};
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
    buf(data) {
        return (0, ndarray_1.default)(data !== null && data !== void 0 ? data : new Uint8Array(this.game.width * this.game.height), [this.game.width, this.game.height]);
    }
    push(data) {
        this.asteroids.push([]);
        this.game.players.forEach((id) => {
            var _a;
            var _b;
            (_a = (_b = this.playerSpecific)[id]) !== null && _a !== void 0 ? _a : (_b[id] = []);
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
                        this.asteroids.at(-1).push([px, py]);
                    }
                    break;
                }
                case "player": {
                    this.game.players.forEach((id) => {
                        if (id !== element.id)
                            return;
                        for (const [x, y] of pos) {
                            const px = x + element.x;
                            const py = y + element.y;
                            if (px < 0 || py < 0 || px >= this.game.width || py >= this.game.height)
                                continue;
                            this.playerSpecific[id].at(-1).push([px, py]);
                        }
                    });
                }
                case "laser": {
                    this.game.players.forEach((id) => {
                        if (id === element.origin)
                            return;
                        for (const [x, y] of pos) {
                            const px = x + element.x;
                            const py = y + element.y;
                            if (px < 0 || py < 0 || px >= this.game.width || py >= this.game.height)
                                continue;
                            this.playerSpecific[id].at(-1).push([px, py]);
                        }
                    });
                }
            }
        }
    }
    static drawPlain(width, _, gameHeight) {
        const pos = [];
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
    static drawPlayer(width, rotation, gameHeight) {
        const pos = [];
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
        let i = 0, j = 0;
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
    exportOneFrame(player, index, length) {
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
    export(player, length = 5) {
        if (!this.length)
            return null;
        const buffs = [];
        for (let i = length; i < this.length; i++) {
            try {
                buffs.push(this.exportOneFrame(player, i, length));
            }
            catch (e) {
                console.log(e);
            }
        }
        return buffs;
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const t = new utils_1.Timer();
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
                const exportData = yield this.export(player, 10);
                if (!exportData) {
                    continue player;
                }
                const saveTimer = new utils_1.Timer();
                yield Promise.all(exportData.map((buf, i) => {
                    const filename = `trace/${this.game.creationTime}/${this.game.id}/${player}/${i}`;
                    return utils_1.PngSaver.save(buf, filename);
                }));
                totalDuration += saveTimer.elapsed();
            }
            const end = t.elapsed();
            console.log(`Png saved in ${(0, utils_1.formatNumber)(totalDuration)} nanoseconds`);
            console.log(`Trace saved in ${(0, utils_1.formatNumber)(end)} nanoseconds`);
        });
    }
}
exports.Trace = Trace;
Trace.cachedDrawings = {};
