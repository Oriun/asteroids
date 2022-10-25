var spriteList = [];
const DESERIALZER = {
  ID: 0,
  TYPE: 1,
  X: 2,
  Y: 3,
  WIDTH: 4,
  HEIGHT: 5,
  ANGLE: 6
};
var _ = DESERIALZER;
var arena = null;
function process(message) {
  var list = message
    .split(";")
    .slice(1)
    .map((a) => a && a.split(":"));
  var newSpriteList = [];
  list.forEach((sprite) => {
    if (!sprite?.length) return;
    var existing = spriteList.findIndex((a) => a.id === sprite[_.ID]);
    var sp;
    if (existing === -1) {
      sp = new Sprite({
        arena,
        width: sprite[_.WIDTH],
        height: sprite[_.HEIGHT],
        id: sprite[_.ID]
      });
      switch (sprite[_.TYPE]) {
        case "Asteroid":
          sp.setImage("/assets/asteroid.png");
          break;
        case "Ship1":
          sp.setImage("/assets/ship1.png");
          break;
        case "Ship2":
          sp.setImage("/assets/ship2.png");
          break;
        case "Ship3":
          sp.setImage("/assets/ship3.png");
          break;
        case "Ship4":
          sp.setImage("/assets/ship4.png");
          break;
        case "Laser":
          sp.setImage();
          break;
        default:
          sp.setImage();
          break;
      }
    } else {
      sp = spriteList.splice(existing, 1)[0];
    }
    sp.positionned(sprite[_.X], -1 * sprite[_.Y]);
    sp.rotate(sprite[_.ANGLE]);
    newSpriteList.push(sp);
  });
  spriteList.forEach((a) => a.kill());
  spriteList = newSpriteList;
}

var socket = new WebSocket("ws://localhost:3000");
var count = 0;
// console.time(count)
socket.onmessage = function ({ data }) {
  // console.timeEnd(count)
  if (data.startsWith("refresh;")) {
    process(data);
  } else if (data.startsWith("end")) {
    window.alert("loose");
  }
  // console.time(++count)
};
const keyNames = [
  "UP",
  "LEFT",
  "DOWN",
  "RIGHT",
  "SHOOT",
  "BACKWARD",
  "SPECIAL"
];
const keys = {
  UP: false, // Z or ArrowUp
  LEFT: false, // D or ArrowLeft
  DOWN: false, // S or ArrowDown
  RIGHT: false, // Q or ArrowRight
  SHOOT: false, // B
  BACKWARD: false, // Shift
  SPECIAL: false // Alt
};
function onKeyChange(current) {
  const code = keyNames.map((a) => (current[a] ? "1" : "0")).join("");
  socket.send(String.fromCharCode(parseInt(code, 2)));
}
function setKeys(newValue) {
  return function (event) {
    event.preventDefault();
    switch (event.code) {
      case "KeyS":
      case "ArrowDown":
        if (keys.DOWN === newValue) return false;
        keys.DOWN = newValue;
        break;
      case "KeyW":
      case "ArrowUp":
        if (keys.UP === newValue) return false;
        keys.UP = newValue;
        break;
      case "KeyA":
      case "ArrowLeft":
        if (keys.LEFT === newValue) return false;
        keys.LEFT = newValue;
        break;
      case "KeyD":
      case "ArrowRight":
        if (keys.RIGHT === newValue) return false;
        keys.RIGHT = newValue;
        break;
      case "AltLeft":
      case "AltRight":
        if (keys.SPECIAL === newValue) return false;
        keys.SPECIAL = newValue;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        if (keys.BACKWARD === newValue) return false;
        keys.BACKWARD = newValue;
        break;
      case "KeyB":
        if (keys.SHOOT === newValue) return false;
        keys.SHOOT = newValue;
        break;
      default:
        return false;
    }
    onKeyChange(keys);
    return false;
  };
}
window.addEventListener("keydown", setKeys(true));
window.addEventListener("keyup", setKeys(false));
window.addEventListener("keypress", (e) => e.preventDefault() || false);
function start(ship = 1) {
  var { width, height } = arena.getBoundingClientRect();
  socket.onopen = () => {
    socket.send(
      "start" + ship + JSON.stringify({ d: 0.5, w: width, h: height })
    );
  };
}
function stop() {
  socket.send("end");
}
window.onload = () => {
  arena = document.body;
  start();
};
window.beforeunload = stop;
