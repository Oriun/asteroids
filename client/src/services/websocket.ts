import { ENDPOINTS } from "./constantes";

type WSMessage = {
  type: string;
  data: unknown;
};
type Listener<T = unknown> = (data: T) => void;
const listeners: Record<string, (Listener<unknown> | undefined)[]> = {};

function openSocket(tries: number = 10) {
  if (!tries) throw new Error("Could not connect to the server");
  return new Promise<WebSocket>((r) => {
    try {
      console.log("connection to websocket", ENDPOINTS.WS);
      const _socket = new WebSocket(ENDPOINTS.WS);
      _socket.onmessage = (e) => {
        const msg = JSON.parse(e.data) as WSMessage;
        if (listeners[msg.type]) {
          listeners[msg.type].forEach((l) => l?.(msg.data));
        }
      };
      _socket.onopen = async () => {
        r(_socket);
      };
    } catch (e) {
      console.error(e);
      return new Promise((r) => {
        setTimeout(() => openSocket(tries - 1).then(r), 1000);
      });
    }
  });
}
let socket = openSocket();
socket.then((s) => {
  console.log("SOCKET OPENED");
  s.onclose = () => {
    console.log("SOCKET CLOSED");
  };
});

export const send = async (data: WSMessage) => {
  (await socket).send(JSON.stringify(data));
};

export const register = <T = unknown>(type: string, listener: Listener<T>) => {
  listeners[type] ??= [];
  const index = listeners[type].push(listener as Listener<unknown>) - 1;
  return () => {
    delete listeners[type][index];
  };
};

export const ask =
  <T = unknown, S = unknown>(type: string) =>
  async (args?: T) => {
    let cleanUp: () => void = () => {};
    const data = await new Promise<S>(async (r) => {
      cleanUp = register(type, r);
      await send({
        type,
        data: args
      });
    });
    cleanUp();
    return data;
  };

export default socket;
