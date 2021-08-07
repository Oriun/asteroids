import { Damageable } from "./damageable.js"

export class Asteroid extends Damageable {

    constructor({
        registery,
        boundaries,
        size = { width: 50, height: 50 },
        state = 2,
        vector = { x: 1, y: 1 },
        velocity = 25,
        origin = { x: 1, y: 1 },
        onKill
    }) {
        super({
            registery,
            size: { height: size.height * state, width: size.width * state },
            image: '/assets/asteroid.png',
            origin,
            boundaries,
            onKill,
            health : state * 10
        })
        this.originalSize = size
        this.state = state
        this.vector = vector
        this.velocity = velocity
        if (!state) super.kill()
    }


    loop() {
        if (this.killed) return
        const newCoordinate = {
            x: (this.vector.x * this.velocity / 10) + this.coordinate.x,
            y: (this.vector.y * this.velocity / 10) + this.coordinate.y
        }
        if (this.canMove(newCoordinate)) {
            this.positioned(newCoordinate)
        }
    }



    canMove({ x, y }) {
        if (this.killed) return false
        if (x < -100 || y > 100) {
            super.kill()
            return false
        }
        const right = x + this.size.width
        const bottom = this.size.height - y
        if (right > (this.boundaries.x + 100) || bottom > (this.boundaries.y + 100)) {
            super.kill()
            return false
        }
        return true
    }

    divide() {
        if (this.killed) return false
        function alter({ x, y }, a) {
            return {
                x: x + a * (.5 - Math.random()),
                y: y + a * (.5 - Math.random())
            }
        }
        new Asteroid({
            registery: this.registery,
            boundaries: this.boundaries,
            size: this.originalSize,
            state: this.state - 1,
            vector: alter(this.vector, .5),
            origin: alter(this.coordinate, 30),
            onKill: this.onKill,
            health: this.maxHealth * (this.state - 1) /this.state
        })
        new Asteroid({
            registery: this.registery,
            boundaries: this.boundaries,
            size: this.originalSize,
            state: this.state - 1,
            vector: alter(this.vector, .5),
            origin: alter(this.coordinate, 30),
            onKill: this.onKill,
            health: this.maxHealth * (this.state - 1) /this.state
        })
        super.kill()
    }
    kill(a) {
        if (this.killed) return false
        if (this.state === 1) {
            super.kill(a)
        } else {
            this.divide()
        }
    }
    forceKill() {
        super.kill()
    }
}
