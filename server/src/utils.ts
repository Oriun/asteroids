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
  return Array.from({ length: width * height }, () => 0);
};

export const zeros = (
  width: number,
  height: number,
  shape: number
): number[][] => {
  return Array.from({ length: width * height }, () =>
    Array.from({ length: shape }, () => 0)
  );
};

export const finiteQueue = <T>(size: number): T[] => {
  const queue: T[] = [];
  queue.push = (item: T) => {
    if (queue.length >= size) queue.shift();
    return Array.prototype.push.call(queue, item);
  };
  return queue;
};

export class PngSaver {
  static async save(buf: NdArray, filename: string) {
    const paths = filename.split("/");
    paths.pop();
    if (paths.length)
      await mkdir(paths.join("/"), { recursive: true }).catch(() => {});
    const stream = createWriteStream(filename);
    savePixels(buf, "png").pipe(stream);
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }
}

export class Timer {
  start: [number, number];
  constructor() {
    this.start = process.hrtime();
  }
  elapsed() {
    const end = process.hrtime(this.start);
    return end[0] * 1e9 + end[1];
  }
}

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
