import { WebSocket } from 'ws'


const current = {
    UP: false,
    LEFT: false,
    DOWN: true,
    RIGHT: false,
    SHOOT: false,
    BACKWARD: false
}
const keys = ["UP", "LEFT", "DOWN", "RIGHT", "SHOOT", "BACKWARD"]

const wait = ms => new Promise(r => setTimeout(r, ms))

const socket = new WebSocket('ws://localhost:3000')

function keyChange() {
    var code = keys.map(a => current[a] ? '1' : '0').join('')
    console.log(code)
    socket.send(String.fromCharCode(parseInt(code,2)))
}
socket.on('open', async function open() {

    keyChange()
    await wait(1000)
    current.SHOOT = true
    current.DOWN = false
    keyChange()
    await wait(500)
    current.SHOOT = false
    keyChange()
})

// socket.on('message', function incoming(message) {
//     if (message === "ping") socket.send('pong')
// })