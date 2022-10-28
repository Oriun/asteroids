"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import Routes from "./routes";
const websocket_1 = __importDefault(require("./websocket"));
const shortid_1 = __importDefault(require("shortid"));
const cors_1 = __importDefault(require("cors"));
// remove - char because it's breaking natural dblClick selection
shortid_1.default.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_£");
const App = (0, express_1.default)();
App.use((0, cors_1.default)());
App.use(express_1.default.json());
// App.use("/api", Routes);
App.listen(5000, () => {
    console.log("Server running");
}).on("upgrade", websocket_1.default);
