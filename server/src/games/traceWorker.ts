// Access the workerData by requiring it.
const { parentPort } = require("worker_threads");
import ndarray, { NdArray } from "ndarray";
import { PngSaver } from "../utils";
// Something you shouldn"t run in main thread
// since it will block.

type SaveMessage = {
  type: "save";
  data: { buf: NdArray; filename: string };
};

type DrawMessage = {
  type: "draw";
  data: {
    asteroidSlice: [number, number][][];
    playerSlice: [number, number][][];
    traceGamma: number;
    width: number;
    height: number;
    length: number;
  };
};

type Message = SaveMessage | DrawMessage;

// Main thread will pass the data you need
// through this event listener.
parentPort.on("message", async (message: Message) => {
  if (message.type === "save") {
    const { buf, filename } = (message as SaveMessage).data;
    await PngSaver.save(buf, filename);
    parentPort.postMessage("ok");
    return;
  }
  // return the result to main thread.
  parentPort.postMessage("ko");
});
