import { NdArray } from "ndarray";
import Game from "../games";
import { bound } from "../utils";
import { GameElement, ItemTypes, SerializedGameElement } from "./base";
import { Laser } from "./laser";

export class Player implements GameElement {
  type: ItemTypes;
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  #_speed: number;
  dead = false;
  onDeath?(game: Game | undefined): void;
  age = 0;
  lastShoot = 0;
  fireRate = 5;
  game: Game;
  canShoot = true;
  canRotate = true;
  canAccelerate = true;

  constructor(id: string, x: number, y: number, width: number, height: number, rotation: number, game: Game) {
    this.id = id;
    this.type = "player";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.#_speed = 0;
    this.game = game;
  }

  get speed(): number {
    return this.#_speed;
  }
  set speed(speed: number) {
    this.#_speed = bound(speed, 0, 175);
  }
  die(game?: Game | undefined) {
    if (this.dead) return;
    this.dead = true;
    (game ?? this.game).remove(this.id);
    if (this.onDeath) {
      this.onDeath(game ?? this.game);
    }
  }
  serialize(): SerializedGameElement {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      width: this.width,
      height: this.height,
    };
  }
  live(game: Game, delay: number): void {
    if (this.dead) return;
    this.age += delay;
    // if (this.age >= 30_000) return this.die(game);
    const radians = (this.rotation * Math.PI) / 180;
    this.x += (Math.cos(radians) * this.speed * delay) / 1000;
    this.y += (Math.sin(radians) * this.speed * delay) / 1000;
    this.canAccelerate = true;
    this.canRotate = true;
    this.canShoot = true;
    if (this.x < -this.width || this.x > game.width || this.y < -this.height || this.y > game.height) {
      return this.die(game);
    }
    this.speed -= 3;
  }
  collide(game: Game, other: GameElement): void {
    if (this.dead) return;
    switch (other.type) {
      case "player": {
        this.die(game);
        other.die(game);
        break;
      }
      case "laser": {
        const laser = other as Laser;
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
  shoot(game?: Game): void {
    if (this.dead || !this.canShoot) return;
    if (this.age - this.lastShoot < this.fireRate) return;
    this.canShoot = false;
    (game ?? this.game).insert(
      new Laser(this.x + this.width / 2, this.y + this.height / 2, 5, 5, this.rotation, this.id)
    );
    this.lastShoot = this.age;
  }
  rotate(direction: boolean): void {
    if (this.dead || !this.canRotate) return;
    this.canRotate = false;
    this.rotation += direction ? 5 : -5;
    this.speed -= 2;
  }
  accelerate(direction: boolean): void {
    if (this.dead || !this.canAccelerate) return;
    this.canAccelerate = false;
    this.speed += direction ? 10 : -10;
  }
}
