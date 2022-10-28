"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = exports.Timer = exports.PngSaver = exports.finiteQueue = exports.zeros = exports.zeros2d = exports.circleCollision = exports.bound = exports.randomInNormalDistribution = exports.boundedRandom = exports.randomPick = exports.rand = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const save_pixels_1 = __importDefault(require("save-pixels"));
function rand() {
    return crypto_1.default.randomBytes(4).readUInt32LE(0) / 0xffffffff;
}
exports.rand = rand;
const randomPick = (array) => {
    return array[Math.floor(rand() * array.length)];
};
exports.randomPick = randomPick;
const boundedRandom = (min, max) => {
    return rand() * (max - min) + min;
};
exports.boundedRandom = boundedRandom;
const randomInNormalDistribution = (std = 0.2) => {
    return (0.5 +
        std * Math.sqrt(-2 * Math.log(rand())) * Math.cos(2 * Math.PI * rand()));
};
exports.randomInNormalDistribution = randomInNormalDistribution;
const bound = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};
exports.bound = bound;
const circleCollision = (x1, y1, r1, x2, y2, r2) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
};
exports.circleCollision = circleCollision;
const zeros2d = (width, height) => {
    return Array.from({ length: width * height }, () => 0);
};
exports.zeros2d = zeros2d;
const zeros = (width, height, shape) => {
    return Array.from({ length: width * height }, () => Array.from({ length: shape }, () => 0));
};
exports.zeros = zeros;
const finiteQueue = (size) => {
    const queue = [];
    queue.push = (item) => {
        if (queue.length >= size)
            queue.shift();
        return Array.prototype.push.call(queue, item);
    };
    return queue;
};
exports.finiteQueue = finiteQueue;
class PngSaver {
    static save(buf, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = filename.split("/");
            paths.pop();
            if (paths.length)
                yield (0, promises_1.mkdir)(paths.join("/"), { recursive: true }).catch(() => { });
            const stream = (0, fs_1.createWriteStream)(filename);
            (0, save_pixels_1.default)(buf, "png").pipe(stream);
            yield new Promise((resolve, reject) => {
                stream.on("finish", resolve);
                stream.on("error", reject);
            });
        });
    }
}
exports.PngSaver = PngSaver;
class Timer {
    constructor() {
        this.start = process.hrtime();
    }
    elapsed() {
        const end = process.hrtime(this.start);
        return end[0] * 1e9 + end[1];
    }
}
exports.Timer = Timer;
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
exports.formatNumber = formatNumber;
