"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asteroid = void 0;
const shortid_1 = __importDefault(require("shortid"));
const utils_1 = require("../utils");
class Asteroid {
    constructor(x, y, width, height, rotation) {
        this.dead = false;
        this.id = (0, shortid_1.default)();
        this.type = "asteroid";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.speed = 75;
    }
    static fromEdge(game) {
        let x = 0, y = 0, startRotation = 0, height = 100, width = 100;
        switch ((0, utils_1.randomPick)(["top", "bottom", "left", "right"])) {
            case "top": {
                x = (0, utils_1.boundedRandom)(0.2, 0.8) * game.width;
                y = game.height;
                startRotation = 195;
                break;
            }
            case "left": {
                x = -width;
                y = (0, utils_1.boundedRandom)(0.2, 0.8) * game.height;
                startRotation = 285;
                break;
            }
            case "bottom": {
                x = (0, utils_1.boundedRandom)(0.2, 0.8) * game.width;
                y = -height;
                startRotation = 15;
                break;
            }
            case "right": {
                x = game.width;
                y = (0, utils_1.boundedRandom)(0.2, 0.8) * game.height;
                startRotation = 105;
                break;
            }
        }
        const rotation = startRotation + (0, utils_1.randomInNormalDistribution)() * 150;
        return new Asteroid(x, y, width, height, rotation);
    }
    die(game) {
        if (this.dead)
            return;
        this.dead = true;
        game === null || game === void 0 ? void 0 : game.remove(this.id);
    }
    serialize() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            rotation: this.rotation,
            width: this.width,
            height: this.height
        };
    }
    live(game, delay) {
        if (this.dead)
            return;
        const radians = (this.rotation * Math.PI) / 180;
        this.x += (Math.cos(radians) * this.speed * delay) / 1000;
        this.y += (Math.sin(radians) * this.speed * delay) / 1000;
        if (this.x < -this.width ||
            this.x > game.width ||
            this.y < -this.height ||
            this.y > game.height) {
            this.die(game);
        }
    }
    collide(game, other) {
        if (this.dead)
            return;
        switch (other.type) {
            case "player": {
                other.die(game);
                this.speed /= 2;
                break;
            }
            case "laser": {
                this.die(game);
                other.die(game);
                break;
            }
            case "asteroid": {
                // For now just overlap
                // TODO: bounce off each other
                break;
            }
            default: {
                break;
            }
        }
    }
}
exports.Asteroid = Asteroid;
