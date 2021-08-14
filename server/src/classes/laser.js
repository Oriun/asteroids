import { Movable } from "./movable.js"
import { intersect} from './edges.js'

export class Laser extends Movable {
    constructor({
        origin,
        vector,
        boundaries,
        registery,
        force,
        size = { width: 10, height: 10 },
        edges,
        id
    }) {
        super({
            size,
            registery,
            health: 10,
            velocity: 100,
            boundaries,
            origin,
            edges
        })
        this.force = force
        this.vector = vector
        this.origin = id
    }

    loop() {
        if (this.killed) return
        this.collisionCheck()
        const newCoordinate = {
            x: (this.vector.x * this.velocity / 10) + this.coordinate.x,
            y: (this.vector.y * this.velocity / 10) + this.coordinate.y
        }
        if (this.canMove(newCoordinate)) {
            this.positioned(newCoordinate)
        } else {
            this.kill()
        }
    }

    collisionCheck() {
        var ast = this.registery.find(sprite => {
            if (sprite.origin === this.origin || this.id === sprite.id) return false
            return sprite.edges && intersect(sprite.edges, this.edges)
        })
        if (ast) {
            console.log("Laser making Damages to ", ast)
            ast.takeDamage(this.force)
            this.kill()
        }
    }
}