import { WebSocket } from 'ws'


const current = {
    UP: false,
    LEFT: false,
    DOWN: false,
    RIGHT: false,
    SHOOT: false,
    BACKWARD: false,
    SPECIAL: false
}
const keys = ["UP", "LEFT", "DOWN", "RIGHT", "SHOOT", "BACKWARD", "SPECIAL"]

const wait = ms => new Promise(r => setTimeout(r, ms))

const socket = new WebSocket('ws://localhost:3000')

function cleanExit() {
    console.log('ending')
    socket.send('end')
}

function keyChange() {
    var code = keys.map(a => current[a] ? '1' : '0').join('')
    console.log(code)
    socket.send(String.fromCharCode(parseInt(code, 2)))
}
socket.on('open', async function open() {

    console.log('starting')
    await wait(1000)
    socket.send('start' + 1 + JSON.stringify({ d: 2, w: 500, h: 500 }))
    await wait(1000)
    current.RIGHT = false
    keyChange()
    await wait(1000)
    current.SHOOT = true
    current.DOWN = false
    keyChange()
    await wait(500)
    current.SHOOT = false
    current.RIGHT = false
    keyChange()
    await wait(10000)
    cleanExit()
})

// socket.on('message', function incoming(message) {
//     if (message === "ping") socket.send('pong')
// })


process.on('SIGINT', cleanExit)
process.on('uncaughtException', cleanExit)