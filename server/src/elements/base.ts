import { NdArray } from "ndarray";
import type { Game } from "../games";

export type ItemTypes = "player" | "asteroid" | "laser" | "explosion";

export type SerializedGameElement = {
  id: string;
  type: ItemTypes;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
};

export interface GameElement {
  type: ItemTypes;
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  speed: number;
  dead: boolean;
  die(game?: Game): void;
  serialize(): SerializedGameElement;
  live(game: Game, delay: number): void;
  collide(game: Game, other: GameElement): void;
}
