import { NdArray, TypedArray, GenericArray } from "ndarray";
import shortid from "shortid";
import Game from "../games";
import { randomPick, boundedRandom, randomInNormalDistribution } from "../utils";
import { GameElement, ItemTypes, SerializedGameElement } from "./base";

export class Asteroid implements GameElement {
  type: ItemTypes;
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  speed: number;
  dead = false;

  constructor(x: number, y: number, width: number, height: number, rotation: number) {
    this.id = shortid();
    this.type = "asteroid";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.speed = 120;
  }

  static fromEdge(game: Game): Asteroid {
    let x = 0,
      y = 0,
      startRotation = 0,
      height = 100,
      width = 100;
    switch (randomPick(["top", "bottom", "left", "right"])) {
      case "top": {
        x = boundedRandom(0.2, 0.8) * game.width;
        y = game.height;
        startRotation = 195;
        break;
      }
      case "left": {
        x = -width;
        y = boundedRandom(0.2, 0.8) * game.height;
        startRotation = 285;
        break;
      }
      case "bottom": {
        x = boundedRandom(0.2, 0.8) * game.width;
        y = -height;
        startRotation = 15;
        break;
      }
      case "right": {
        x = game.width;
        y = boundedRandom(0.2, 0.8) * game.height;
        startRotation = 105;
        break;
      }
    }
    const rotation = startRotation + randomInNormalDistribution() * 150;
    return new Asteroid(x, y, width, height, rotation);
  }
  die(game?: Game | undefined): void {
    if (this.dead) return;
    this.dead = true;
    game?.remove(this.id);
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
    const radians = (this.rotation * Math.PI) / 180;
    this.x += (Math.cos(radians) * this.speed * delay) / 1000;
    this.y += (Math.sin(radians) * this.speed * delay) / 1000;
    if (this.x < -this.width || this.x > game.width || this.y < -this.height || this.y > game.height) {
      this.die(game);
    }
  }
  collide(game: Game, other: GameElement): void {
    if (this.dead) return;
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
