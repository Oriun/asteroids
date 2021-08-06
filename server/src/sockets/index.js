import { idGenerator } from '../helpers/random.js';

const socketList = []
const keys = ["UP", "LEFT", "DOWN", "RIGHT", "SHOOT", "BACKWARD"]
function parse(binary) {
    return Object.fromEntries(keys.map((a, i) => [a, binary[binary.length - keys.length + i] == 1]))
}
function connection(socket) {
    socket.id = idGenerator()
    socket.inGame = true
    socket.on('message', function (message) {
        if (socket.inGame && message.length === 1) {
            console.log(parse(message[0].toString(2)))
        }
    })
}

export default connection