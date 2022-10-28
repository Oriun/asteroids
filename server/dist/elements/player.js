"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Player__speed;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const laser_1 = require("./laser");
class Player {
    constructor(id, x, y, width, height, rotation, game) {
        _Player__speed.set(this, void 0);
        this.dead = false;
        this.age = 0;
        this.lastShoot = 0;
        this.fireRate = 1000 / 5;
        this.canShoot = true;
        this.canRotate = true;
        this.canAccelerate = true;
        this.id = id;
        this.type = "player";
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        __classPrivateFieldSet(this, _Player__speed, 0, "f");
        this.game = game;
    }
    get speed() {
        return __classPrivateFieldGet(this, _Player__speed, "f");
    }
    set speed(speed) {
        __classPrivateFieldSet(this, _Player__speed, Math.max(Math.min(speed, 100), 0), "f");
    }
    die(game) {
        if (this.dead)
            return;
        this.dead = true;
        (game !== null && game !== void 0 ? game : this.game).remove(this.id);
        if (this.onDeath) {
            this.onDeath(game !== null && game !== void 0 ? game : this.game);
        }
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
        this.age += delay;
        // if (this.age >= 5_000) return this.die(game);
        const radians = (this.rotation * Math.PI) / 180;
        this.x += (Math.cos(radians) * this.speed * delay) / 1000;
        this.y += (Math.sin(radians) * this.speed * delay) / 1000;
        this.canAccelerate = true;
        this.canRotate = true;
        this.canShoot = true;
        if (this.x < -this.width ||
            this.x > game.width ||
            this.y < -this.height ||
            this.y > game.height) {
            return this.die(game);
        }
        this.speed -= 3;
    }
    collide(game, other) {
        if (this.dead)
            return;
        switch (other.type) {
            case "player": {
                this.die(game);
                other.die(game);
                break;
            }
            case "laser": {
                const laser = other;
                if (laser.origin !== this.id) {
                    this.die(game);
                    laser.die(game);
                }
                break;
            }
            case "asteroid": {
                this.die(game);
                other.speed /= 2;
                break;
            }
            default: {
                break;
            }
        }
    }
    shoot(game) {
        if (this.dead || !this.canShoot)
            return;
        if (Date.now() - this.lastShoot < this.fireRate)
            return;
        this.canShoot = false;
        (game !== null && game !== void 0 ? game : this.game).insert(new laser_1.Laser(this.x + this.width / 2, this.y + this.height / 2, 5, 5, this.rotation, this.id));
        this.lastShoot = Date.now();
    }
    rotate(direction) {
        if (this.dead || !this.canRotate)
            return;
        this.canRotate = false;
        this.rotation += direction ? 5 : -5;
        this.speed -= 2;
    }
    accelerate(direction) {
        if (this.dead || !this.canAccelerate)
            return;
        this.canAccelerate = false;
        this.speed += direction ? 10 : -10;
    }
}
exports.Player = Player;
_Player__speed = new WeakMap();
