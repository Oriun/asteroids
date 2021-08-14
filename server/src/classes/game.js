
import { Asteroid } from './asteroid.js'
import Constant from '../constants/ships.js'
import { Ship } from './ship.js'
// {
//     d: "difficulty",
//     w: "width",
//     h: "height",
// }
function randBool(ratio = .5) { return Math.random() <= ratio }
var count = 0

export class Game {
    sprites = []
    ships = {}
    ready = false
    running = false
    interval = null
    configure({ d, w, h }) {
        this.boundaries = { x: w, y: h }
        this.spawnNumber = Math.floor(5 * d)
        this.ready = true
        return this
    }
    createShip(shipId, userId) {
        var shipData = Constant.find(a => a.id == shipId)
        // console.log(Constant, shipId, shipData)
        if (!shipData) throw new Error('Unknown ship')
        this.ships[userId]?.kill(false)
        this.ships[userId] = new Ship({
            ...shipData,
            registery: this.sprites,
            boundaries: this.boundaries,
            onKill: () => this.end()
        })
        return this
    }
    send() { /* Must be overriden */ }
    start() {
        this.spawnLoop = setInterval(() => {
            new Array(this.spawnNumber).fill(1).map(() => this.createAsteroid())
        }, 8000)
        this.running = true
        // this.loop()
        this.mainLoop = setInterval(() => this.loop(), 5)
        new Array(this.spawnNumber).fill(1).map(() => this.createAsteroid())
        return this
    }
    loop() {
        if (!this.running) return
        // console.time(++count)
        this.sprites.forEach(a => a.loop())
        this.send(this.stringSerializer())
        // console.timeEnd(count)
        // setTimeout(() => this.loop(), 5)
    }
    end() {
        this.running = false
        clearInterval(this.spawnLoop)
        clearInterval(this.mainLoop)
        this.send('end')
        return this
    }
    stringSerializer() {
        return this.serialize()
            .map(a => {
                return a.id + ':' + a.type + ':' + a.x.toFixed(1) + ':' + a.y.toFixed(1) + ':' + a.width + ':' + a.height + ':' + a.angle
            })
            .join(';')
    }
    serialize() {
        return this.sprites.map(a => a.serialize())
    }


    randomAsteroidCoordinates() {
        var x = -100
        var y = -100

        if (randBool()) { // free on x axis
            if (randBool()) {
                x = this.boundaries.x * Math.random()
            }
            if (randBool()) {
                y = this.boundaries.y
            }
        } else {
            if (randBool()) {
                x = this.boundaries.x
            }
            if (randBool()) {
                y = this.boundaries.y * Math.random()
            }
        }
        return { x, y }
    }
    randDirection({ x: originX, y: originY }) {
        var x = Math.random()
        var y = 1 - x
        if (originX > 0) x *= -1
        if (originY > 0) y *= -1
        return { x, y }
    }
    createAsteroid() {
        var origin = this.randomAsteroidCoordinates()
        var vector = this.randDirection(origin)
        var state = randBool(.2) ? 3 : randBool(.8) ? 2 : 1

        new Asteroid({
            registery: this.sprites,
            boundaries: this.boundaries,
            origin,
            vector,
            state,
        })
    }
}
