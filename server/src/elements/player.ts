import { NdArray } from "ndarray";
import shortid from "shortid";
import Game from "../games";
import { finiteQueue } from "../utils";
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
  fireRate = 1000 / 5;
  game: Game;
  trace: SerializedGameElement[];

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    game: Game,
    traceLength: number
  ) {
    this.id = id;
    this.type = "player";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.#_speed = 0;
    this.game = game;
    this.trace = finiteQueue(traceLength);
  }

  get speed(): number {
    return this.#_speed;
  }
  set speed(speed: number) {
    this.#_speed = Math.max(Math.min(speed, 100), 0);
  }
  die(game?: Game | undefined) {
    if (this.dead) return;
    this.dead = true;
    game?.render();
    (game ?? this.game).remove(this.id);
    if (this.onDeath) {
      this.onDeath(game ?? this.game);
    }
  }
  serialize(save = false): SerializedGameElement {
    const data = {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      width: this.width,
      height: this.height
    };
    if (save) this.trace.push(data);
    return data;
  }
  live(game: Game, delay: number): void {
    if (this.dead) return;
    this.age += delay;
    const radians = (this.rotation * Math.PI) / 180;
    this.x += (Math.cos(radians) * this.speed * delay) / 1000;
    this.y += (Math.sin(radians) * this.speed * delay) / 1000;
    if (
      this.x < -this.width ||
      this.x > game.width ||
      this.y < -this.height ||
      this.y > game.height
    ) {
      return this.die(game);
    }
    this.speed -= 10;
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
    if (this.dead) return;
    if (Date.now() - this.lastShoot < this.fireRate) return;
    (game ?? this.game).insert(
      new Laser(
        this.x + this.width / 2,
        this.y + this.height / 2,
        5,
        5,
        this.rotation,
        this.id
      )
    );
    this.lastShoot = Date.now();
  }
  rotate(direction: boolean): void {
    if (this.dead) return;
    this.rotation += direction ? 5 : -5;
    this.accelerate(false);
  }
  accelerate(direction: boolean): void {
    if (this.dead) return;
    this.speed += direction ? 10 : -10;
  }
  draw(buf: NdArray, game: Game): void {
    // Draw a cricle around the player as it's hitbox
    const centerX = this.x + this.width / 2;
    const centerY = this.y - this.width / 2;
    vertical: for (let i = this.width; i > 0; i--) {
      if (Math.floor(this.y + i) < 0 || Math.floor(this.y + i) >= game.height)
        continue vertical;
      let j = 0;
      horizontal: while (true) {
        const dist = Math.sqrt(j ** 2 + (this.y - i - centerY) ** 2);
        if (dist > this.width / 2) {
          j--;
          buf.set(
            Math.floor(centerX - j - 1),
            game.height - Math.floor(this.y + i - 1),
            255
          );
          buf.set(
            Math.floor(centerX - j),
            game.height - Math.floor(this.y + i),
            255
          );
          buf.set(
            Math.floor(centerX + j),
            game.height - Math.floor(this.y + i),
            255
          );
          buf.set(
            Math.floor(centerX + j + 1),
            game.height - Math.floor(this.y + i + 1),
            255
          );
          break horizontal;
        }
        j++;
      }
    }

    // Draw a triangle to represent the player
    let i = 0,
      j = 0;
    direction: while (true) {
      const dist = Math.sqrt(i ** 2 + j ** 2);
      if (dist > this.width / 2) {
        break direction;
      }
      buf.set(
        Math.floor(centerX + i),
        game.height - Math.floor(centerY + this.width + j),
        255
      );
      buf.set(
        Math.floor(centerX + i - 1),
        game.height - Math.floor(centerY + this.width + j),
        255
      );
      buf.set(
        Math.floor(centerX + i + 1),
        game.height - Math.floor(centerY + this.width + j),
        255
      );

      //update i and j based on rotation
      const radians = (this.rotation * Math.PI) / 180;
      i += Math.cos(radians);
      j += Math.sin(radians);
    }
  }
}
