"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Laser = void 0;
const shortid_1 = __importDefault(require("shortid"));
class Laser {
    constructor(x, y, width, height, rotation, playerId) {
        this.dead = false;
        this.id = (0, shortid_1.default)();
        this.type = "laser";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.speed = 120;
        this.origin = playerId;
    }
    die(game) {
        if (this.dead)
            return;
        this.dead = true;
        if (game)
            game.remove(this.id);
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
                if (this.origin !== other.id) {
                    other.die(game);
                }
                break;
            }
            case "asteroid": {
                other.die(game);
                this.die(game);
                break;
            }
            default: {
                break;
            }
        }
    }
}
exports.Laser = Laser;
