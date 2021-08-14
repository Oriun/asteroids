import { WebSocketServer } from 'ws'
import { idGenerator } from './helpers/random.js';
import Game from './classes/index.js'

const server = new WebSocketServer({
    host: "0.0.0.0",
    port: 3000
})

let socketList = []

const keys = ["UP", "LEFT", "DOWN", "RIGHT", "SHOOT", "BACKWARD", "SPECIAL"]
function parse(binary) {
    return Object.fromEntries(keys.map((a, i) => [a, binary[binary.length - keys.length + i] == 1]))
}

function connection(socket) {
    socket.id = idGenerator()
    socket.inGame = false
    console.log('new connection', socket.id)
    socket.send('id' + socket.id)
    socketList.push(socket)
    socket.game = new Game()
    socket.on('message', function (message) {
        // console.log('new message from ', socket.id)
        if (socket.inGame && message.length === 1) {
            const input = parse(message[0].toString(2))
            socket.game.ships[socket.id]?.setKeys(input)
        } else {
            const json = message.toString()
            if (json.startsWith('start')) {
                if(socket.inGame){
                    socket.game.end()
                    socket.game = new Game()
                }
                socket.inGame = true
                socket.game
                    .configure(JSON.parse(json.slice(6)))
                    .createShip(json[5], socket.id)
                    .start()
                    .send = a => socket.send("refresh;" + a)
            } else if (json.startsWith('end')) {
                socket.game.end()
                socket.inGame = false
                socket.send('end game')
            } else if (json.startsWith('restore')) {
                var toRestore = socketList.find(a => a.id = json.slice(7))
                if (!toRestore) socket.send('failure')
                else {
                    socket.id = toRestore.id
                    socket.game = toRestore.game
                    socketList = socketList.filter(a => a !== toRestore)
                }
                socket.send('restored')
            } else {
                console.log(json)
            }
        }
    })
}


server.on('connection', connection);

server.on('listening', function () {
    const s = server.address()
    console.log(`WebSocket server listening on ${s.address}:${s.port}`)
})
