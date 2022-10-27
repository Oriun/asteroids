import { NdArray, TypedArray, GenericArray } from "ndarray";
import shortid from "shortid";
import Game from "../games";
import {
  randomPick,
  boundedRandom,
  randomInNormalDistribution
} from "../utils";
import { GameElement, ItemTypes, SerializedGameElement } from "./base";

export class Laser implements GameElement {
  type: ItemTypes;
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  speed: number;
  dead = false;
  origin: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    playerId: string
  ) {
    this.id = shortid();
    this.type = "laser";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.speed = 120;
    this.origin = playerId;
  }

  die(game?: Game | undefined): void {
    if (this.dead) return;
    this.dead = true;
    if (game) game.remove(this.id);
  }
  serialize(): SerializedGameElement {
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
  live(game: Game, delay: number): void {
    if (this.dead) return;
    const radians = (this.rotation * Math.PI) / 180;
    this.x += (Math.cos(radians) * this.speed * delay) / 1000;
    this.y += (Math.sin(radians) * this.speed * delay) / 1000;
    if (
      this.x < -this.width ||
      this.x > game.width ||
      this.y < -this.height ||
      this.y > game.height
    ) {
      this.die(game);
    }
  }
  collide(game: Game, other: GameElement): void {
    if (this.dead) return;
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
  draw(
    buf: NdArray<TypedArray | GenericArray<number> | number[]>,
    game: Game
  ): void {
    const centerX = this.x + this.width / 2;
    const centerY = this.y - this.width / 2;
    vertical: for (let i = 0; i < this.width; i++) {
      if (this.y - i < 0 || this.y - i > game.height) continue vertical;
      let j = 0;
      horizontal: while (true) {
        const dist = Math.sqrt(j ** 2 + (this.y - i - centerY) ** 2);
        if (
          dist.toFixed(1) !== (this.width / 2).toFixed(1) &&
          dist > this.width / 2
        ) {
          break horizontal;
        }
        buf.set(
          Math.floor(centerX - j),
          game.height - Math.floor(this.y - i),
          255
        );
        buf.set(
          Math.floor(centerX + j),
          game.height - Math.floor(this.y - i),
          255
        );
        j++;
      }
    }
  }
}
