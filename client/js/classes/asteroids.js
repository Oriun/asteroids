class GrandAsteroid extends Damageable {

    constructor({
        element,
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
            element,
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
        this.element.classList.add("asteroid")
        this.element.dataset.state = state
        if (!state) super.kill()
        else this.startMoving()
    }


    startMoving() {
        if (this.killed) return
        const newCoordinate = {
            x: (this.vector.x * this.velocity / 10) + this.coordinate.x,
            y: (this.vector.y * this.velocity / 10) + this.coordinate.y
        }
        if (this.canMove(newCoordinate)) {
            this.positioned(newCoordinate)
        }
        reqFrame(() => this.startMoving())
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
        const div1 = document.createElement('div')
        const div2 = document.createElement('div')
        this.element.parentElement.append(div1)
        this.element.parentElement.append(div2)
        function alter({ x, y }, a) {
            return {
                x: x + a * (.5 - Math.random()),
                y: y + a * (.5 - Math.random())
            }
        }
        new GrandAsteroid({
            element: div1,
            registery: this.registery,
            boundaries: this.boundaries,
            size: this.originalSize,
            state: this.state - 1,
            vector: alter(this.vector, .5),
            origin: alter(this.coordinate, 30),
            onKill: this.onKill,
            health: this.maxHealth * (this.state - 1) /this.state
        })
        new GrandAsteroid({
            element: div2,
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
