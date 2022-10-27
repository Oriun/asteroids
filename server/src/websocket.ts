import shortid from "shortid";
import { Server, WebSocket } from "ws";
import { Player } from "./elements/player";
import Game from "./games";

type WSMessage<T = unknown> = {
  type: string;
  data: T;
};

const websocketServer = new Server({
  noServer: true,
  path: "/api/ws"
});

function upgrade(request: any, socket: any, head: any) {
  websocketServer.handleUpgrade(request, socket, head, (websocket) => {
    console.log("connection");
    websocketServer.emit("connection", websocket, request);
  });
}

function respond(socket: WebSocket, type: string, data: unknown) {
  socket.send(
    JSON.stringify({
      type,
      data
    } as WSMessage)
  );
}

function broadcast(socketIds: string[], type: string, data?: unknown) {
  socketIds.forEach((id) => {
    const socket = sockets[id];
    if (socket) {
      respond(socket, type, data);
    }
  });
}

function Unrecognize(socket: WebSocket, data: WSMessage) {
  respond(socket, "unrecognized", data);
}

function UnexpectedError(socket: WebSocket, error: Error, message: string) {
  respond(socket, "unexpected_error", {
    error: {
      message: error.message,
      stack: error.stack
    },
    message
  });
}

function UnknownClient(socket: WebSocket, event: string, data: unknown) {
  respond(socket, "unknown_client", null);
  respond(socket, event, data);
}

const sockets: Record<string, WebSocket> = {};
const games: Record<string, Game> = {};
const players: Record<string, Player> = {};
const playerToGame: Record<string, string> = {};

websocketServer.on("connection", (socket) => {
  let id: string = shortid();
  sockets[id] = socket;
  console.log("connnection");

  respond(socket, "connected", id);

  socket.on("message", async (message) => {
    // console.log("new message", message.toString());
    try {
      const payload = JSON.parse(message.toString()) as WSMessage;

      switch (payload.type) {
        case "id": {
          respond(socket, "id", id);
          break;
        }
        case "new_game": {
          const { players: playerIds } = payload.data as { players: string[] };
          const game = new Game(...playerIds);
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
          game.onStart = (game) =>
            broadcast(game.players, "game_started", game.id);
          game.onUpdate = (game, data) =>
            broadcast(game.players, "game_updated", { items: data });
          break;
        }
        case "rotate": {
          const { direction } = payload.data as { direction: boolean };
          const player = players[id];
          if (player) {
            player.rotate(direction);
          }
          break;
        }
        case "accelerate": {
          const { direction } = payload.data as { direction: boolean };
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
    } catch (e) {
      UnexpectedError(socket, e as Error, message.toString());
    }
  });

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
export default upgrade;
