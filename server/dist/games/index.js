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
exports.Game = void 0;
const shortid_1 = __importDefault(require("shortid"));
const asteroid_1 = require("../elements/asteroid");
const player_1 = require("../elements/player");
const utils_1 = require("../utils");
const trace_1 = require("./trace");
class Game {
    constructor(...players) {
        this.creationTime = Date.now();
        this.frameRate = 1000 / 30;
        this.time = 0;
        this.elements = [];
        this.width = 1000;
        this.height = 900;
        this.stopped = false;
        this.id = (0, shortid_1.default)();
        this.players = players;
        this.gameLoop = 0;
        this.trace = new trace_1.Trace(this);
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
        var _a;
        console.log("game started");
        (_a = this.onStart) === null || _a === void 0 ? void 0 : _a.call(this, this);
        let lastTime = Date.now();
        this.gameLoop = setInterval(() => {
            var _a;
            const now = Date.now();
            const delay = now - lastTime;
            process.stdout.write("\r" + Math.floor(1000 / delay) + "fps");
            lastTime = now;
            this.time++;
            if (this.time % 25 === 0) {
                this.insert(asteroid_1.Asteroid.fromEdge(this));
            }
            for (const element of this.elements) {
                element.live(this, delay);
                for (const other of this.elements) {
                    if (other.id === element.id)
                        continue;
                    if ((0, utils_1.circleCollision)(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, other.x + other.width / 2, other.y + other.height / 2, other.width / 2)) {
                        element.collide(this, other);
                    }
                }
            }
            const serialize = this.serialize();
            (_a = this.onUpdate) === null || _a === void 0 ? void 0 : _a.call(this, this, serialize);
            this.trace.push(serialize);
        }, this.frameRate);
    }
    stop() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stopped)
                return;
            this.stopped = true;
            clearInterval(this.gameLoop);
            (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this, this);
            yield this.trace.save();
            (_b = this.onSave) === null || _b === void 0 ? void 0 : _b.call(this, this);
        });
    }
    remove(elementId) {
        this.elements = this.elements.filter((e) => e.id !== elementId);
    }
    serialize() {
        return this.elements.map((element) => element.serialize());
    }
    insert(element) {
        this.elements.push(element);
    }
    newPlayer(playerId) {
        const pos = this.center;
        const player = new player_1.Player(playerId, pos.x, pos.y, 50, 50, 180, this);
        this.insert(player);
        const rotateInterval = setInterval(() => {
            if (player.dead)
                clearInterval(rotateInterval);
            player.rotate(true);
        }, this.frameRate);
        const speedUp = setInterval(() => {
            if (player.dead)
                clearInterval(speedUp);
            player.accelerate(true);
        }, this.frameRate * 2);
        const shoot = setInterval(() => {
            if (player.dead)
                clearInterval(shoot);
            player.shoot();
        }, this.frameRate * 45);
        return player;
    }
}
exports.Game = Game;
exports.default = Game;
