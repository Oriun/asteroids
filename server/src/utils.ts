import crypto from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { NdArray } from "ndarray";
import savePixels from "save-pixels";

export function rand() {
  return crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff;
}

export const randomPick = <T>(array: T[]): T => {
  return array[Math.floor(rand() * array.length)];
};

export const boundedRandom = (min: number, max: number): number => {
  return rand() * (max - min) + min;
};

export const randomInNormalDistribution = (std: number = 0.2): number => {
  return (
    0.5 +
    std * Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand())
  );
};

export const bound = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
export const circleCollision = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean => {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
};

export const zeros2d = (width: number, height: number): number[] => {
  const array = new Array(width * height);
  for (let i = 0; i < array.length; i++) {
    array[i] = 0;
  }
  return array;
};
export const zeros = (
  width: number,
  height: number,
  shape: number
): number[] => {
  const array = new Array(width * height);
  for (let i = 0; i < array.length; i++) {
    array[i] = new Array(shape).fill(0);
  }
  return array;
};

export const finiteQueue = <T>(size: number): T[] => {
  const queue: T[] = [];
  queue.push = (item: T) => {
    if (queue.length >= size) {
      queue.shift();
    }
    return Array.prototype.push.call(queue, item);
  };
  return queue;
};

export const saveToPng = async (buf: NdArray, filename: string) => {
  const paths = filename.split("/");
  paths.pop();
  paths.length &&
    (await mkdir(paths.join("/"), { recursive: true }).catch(() => {}));
  console.log("saving");
  const out = createWriteStream(filename + ".png");
  savePixels(buf, "png").pipe(out);
  await new Promise((resolve) => out.on("finish", resolve));
  console.log("saved");
};
