// import { idGenerator } from "../helpers/index.js"

var count = 0

export class Movable {

    constructor({
        size = { width: 100, height: 100 },
        image,
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        origin = { x: 0, y: 0 },
        defaultOrientation = 0,
        registery,
        onKill
    }) {
        this.id = ++count// idGenerator()
        this.registery = registery
        registery.push(this)
        this.size = size
        this.velocity = velocity
        this.boundaries = boundaries
        this.orientation = defaultOrientation
        this.onKill = onKill
        this.positioned(origin)

    }
    loop() { }

    canMove({ x, y }) {
        if (this.killed) return false
        if (x < 0 || y > 0) {
            return false
        }
        const right = x + this.size.width
        const bottom = this.size.height - y
        if (right > this.boundaries.x || bottom > this.boundaries.y) {
            return false
        }
        return true
    }

    kill(share = false) {
        if (this.killed) return false
        this.registery.splice(this.registery.findIndex(a => a === this), 1)
        this.killed = true
        if (share) {
            this.onKill?.()
        }
    }
    forceKill() {
        this.kill()
    }

    positioned({ x, y }) {
        if (this.killed) return false
        this.coordinate = { x, y }
    }
    serialize() {
        return {
            ...this.coordinate,
            ...this.size,
            angle: this.orientation,
            id: this.id,
            type: this.constructor.name
        }
    }
}