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
const shortid_1 = __importDefault(require("shortid"));
const ws_1 = require("ws");
const games_1 = __importDefault(require("./games"));
const websocketServer = new ws_1.Server({
    noServer: true,
    path: "/api/ws"
});
function upgrade(request, socket, head) {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        console.log("connection");
        websocketServer.emit("connection", websocket, request);
    });
}
function respond(socket, type, data) {
    socket.send(JSON.stringify({
        type,
        data
    }));
}
function broadcast(socketIds, type, data) {
    socketIds.forEach((id) => {
        const socket = sockets[id];
        if (socket) {
            respond(socket, type, data);
        }
    });
}
function Unrecognize(socket, data) {
    respond(socket, "unrecognized", data);
}
function UnexpectedError(socket, error, message) {
    respond(socket, "unexpected_error", {
        error: {
            message: error.message,
            stack: error.stack
        },
        message
    });
}
function UnknownClient(socket, event, data) {
    respond(socket, "unknown_client", null);
    respond(socket, event, data);
}
const sockets = {};
const games = {};
const players = {};
const playerToGame = {};
websocketServer.on("connection", (socket) => {
    let id = (0, shortid_1.default)();
    sockets[id] = socket;
    console.log("connnection");
    respond(socket, "connected", id);
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log("new message", message.toString());
        try {
            const payload = JSON.parse(message.toString());
            switch (payload.type) {
                case "id": {
                    respond(socket, "id", id);
                    break;
                }
                case "new_game": {
                    const { players: playerIds } = payload.data;
                    const game = new games_1.default(...playerIds);
                    games[game.id] = game;
                    broadcast(game.players, "new_game", game.id);
                    game.players.forEach((playerId) => {
                        playerToGame[playerId] = game.id;
                        const playerObject = game.newPlayer(id);
                        playerObject.onDeath = () => {
                            broadcast(game.players, "player_death", playerObject.id);
                            console.log("Player died");
                            if (!game.elements.find((element) => element.type === "player")) {
                                console.log("Game over");
                                broadcast(game.players, "game_over");
                                game.stop();
                            }
                        };
                        players[playerId] = playerObject;
                    });
                    game.onStart = (game) => broadcast(game.players, "game_started", game.id);
                    game.onUpdate = (game, data) => broadcast(game.players, "game_updated", { items: data });
                    game.start();
                    game.onSave = (game) => {
                        console.log("game saved");
                        broadcast(game.players, "game_saved", game.id);
                        delete games[game.id];
                    };
                    break;
                }
                case "rotate": {
                    const { direction } = payload.data;
                    const player = players[id];
                    if (player) {
                        player.rotate(direction);
                    }
                    break;
                }
                case "accelerate": {
                    const { direction } = payload.data;
                    const player = players[id];
                    if (player) {
                        player.accelerate(direction);
                    }
                    break;
                }
                case "shoot": {
                    const player = players[id];
                    if (player) {
                        player.shoot();
                    }
                    break;
                }
                case "game_updated":
                case "game_started":
                    // Events from the client are ignored
                    break;
                default:
                    Unrecognize(socket, payload);
                    break;
            }
        }
        catch (e) {
            UnexpectedError(socket, e, message.toString());
        }
    }));
    socket.on("close", () => {
        delete sockets[id];
        const player = players[id];
        if (player) {
            player.die();
            delete players[id];
            const game = games[playerToGame[id]];
        }
    });
});
exports.default = upgrade;
