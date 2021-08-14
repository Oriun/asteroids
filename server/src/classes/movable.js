// import { idGenerator } from "../helpers/index.js"
// import Polygon, { Point, Rectangle, rotateAround } from "./polygon.js"
import { Rectangle, intersect, Point } from "./edges.js"

var count = 0

export class Movable {

    constructor({
        size = { width: 100, height: 100 },
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        origin = { x: 0, y: 0 },
        defaultOrientation = 0,
        registery,
        onKill,
        edges
    }) {
        this.id = ++count// idGenerator()
        this.registery = registery
        registery.push(this)
        this.size = size
        this.velocity = velocity
        this.boundaries = boundaries
        this.orientation = defaultOrientation
        this.onKill = onKill
        if (edges) {
            this.edges = new Rectangle(...edges.map(a => new Point(a.x, a.y)))
        } else {
            this.edges = new Rectangle(new Point(size.width, size.height), new Point(0, 0))
        }
        this.positioned(origin)
        this.rotate(defaultOrientation)
    }
    rotate(angle) {
        this.edges.rotate(this.coordinate, angle)
        this.orientation = angle
    }
    loop() { }

    canMove({ x, y }) {
        if (this.killed) return false
        if (x < 0 || y < 0) {
            return false
        }
        let right = x + this.size.width
        let bottom = this.size.height + y
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
        this.coordinate ||= { x: 0, y: 0 }
        if (this.coordinate.x === x && this.coordinate.y === y) return false
        this.edges.translate(x - this.coordinate.x, y - this.coordinate.y)
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