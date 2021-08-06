import * as Classes from './classes/index.js'
import { WebSocketServer } from 'ws'
import Connection from './sockets/index.js'

const server = new WebSocketServer({
    host: "0.0.0.0",
    port: 3000
})

server.on('connection', Connection);

server.on('listening', function () {
    const s = server.address()
    console.log(`WebSocket server listening on ${s.address}:${s.port}`)
})
