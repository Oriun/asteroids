import * as Classes from './classes/index.js'
import { WebSocketServer } from 'ws'
import { idGenerator, randomInteger } from './helpers/random.js';
import { execTime } from './helpers/test.js';

const server = new WebSocketServer({
    host: "0.0.0.0",
    port: 3000
})

server.on('connection', function connection(socket) {
    socket.id = idGenerator()
    console.time('ping')
    socket.send('ping')
    socket.on('message', function (message) {
        if (message === 'pong') console.timeEnd('ping')
    })
    console.timeEnd('ping')


});

server.on('listening', function () {
    const s = server.address()
    console.log(`WebSocket server listening on ${s.address}:${s.port}`)
})

// function Coordinate() {
//     return {
//         x: randomInteger({ max: 500 }),
//         y: randomInteger({ max: 500 })
//     }
// }
// function compare(a, b) {
//     return (a.x ** 2 + a.y ** 2) > (b.x ** 2 + b.y ** 2)
// }
// const Arr = new Array(200).fill(1).map(a => {
//     return {
//         a: Coordinate(),
//         b: Coordinate(),
//         c: Coordinate(),
//         d: Coordinate(),
//         e: Coordinate(),
//         f: Coordinate(),
//         g: Coordinate(),
//         h: Coordinate()
//     }
// })

// const res = () => Arr.map(src => Arr.map(oth => {
//     return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].some(property => compare(src[property], oth[property]))
// }))

// function format(nb){
//     const reversed = nb.toString().split('').reverse().join('')
//     const formatted = reversed.replace(/(\d{3})(?=\d)/gm, `$1_`)
//     return formatted.split('').reverse().join('')
// }

// console.time('42')
// console.log(format(Math.floor(new Array(10).fill(1).reduce((p, c, i) => {
//     var t = execTime(res, 1000)
//     p += t
//     console.log('time :', format(Math.floor(p / ++i)))
//     return p
// }, 0) / 10)))
// console.timeEnd('42')