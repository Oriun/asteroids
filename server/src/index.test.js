import { WebSocket } from 'ws'


new Array(500).fill(1).forEach(() => {
    const socket = new WebSocket('ws://localhost:3000')

    socket.on('open', function open() {
        socket.send('something')
    })

    socket.on('message', function incoming(message) {
        if (message === "ping") socket.send('pong')
    })
})