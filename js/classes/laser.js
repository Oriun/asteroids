class Laser extends Movable {
    constructor({
        origin,
        vector,
        element,
        boundaries,
        registery,
        force,
        size = { width: 10, height: 10 }
    }) {
        super({
            size,
            element,
            registery,
            health: 10,
            velocity: 100,
            boundaries,
            origin
        })
        this.force = force
        this.vector = vector
        this.element.classList.add("laser")
        this.startMoving()
    }

    startMoving() {
        if (this.killed) return
        const newCoordinate = {
            x: (this.vector.x * this.velocity / 10) + this.coordinate.x,
            y: (this.vector.y * this.velocity / 10) + this.coordinate.y
        }
        this.collisionCheck(newCoordinate)
        if (this.canMove(newCoordinate)) {
            this.positioned(newCoordinate)
        } else {
            this.kill()
        }
        reqFrame(() => this.startMoving())
    }

    collisionCheck({ x, y }) {
        const cte = Math.sqrt(2) / 2
        const width = this.size.width
        const height = this.size.height
        const points = [
            {
                x: x + (1 - cte) * width * .5,
                y: y - (1 - cte) * height * .5
            },
            {
                x: x + (width * .5),
                y
            },
            {
                x: x + (1 + cte) * width * .5,
                y: y - (1 - cte) * height * .5
            },
            {
                x: x + (1 - cte) * width * .5,
                y: y - (1 + cte) * height * .5
            },
            {
                x: x + (width * .5),
                y: y - height
            },
            {
                x: x + (1 + cte) * width * .5,
                y: y - (1 + cte) * height * .5
            },
            {
                x,
                y: y - height * .5
            },
            {
                x: x + width,
                y: y - height * .5
            },
        ]
        var ast = null
        for (const xy of points) {
            let ree = document.elementFromPoint(xy.x, -1 * xy.y)
            if (ree?.classList.contains('asteroid')) {
                ast = ree
                break
            }
        }
        if (ast) {
            this.registery.find(a => a.element === ast).takeDamage(this.force)
            this.kill()
        }
    }
}