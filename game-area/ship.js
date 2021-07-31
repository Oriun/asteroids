
class Ship extends Movable {
    activeKeys = {
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false
    }
    constructor({
        element,
        size = { width: 100, height: 100 },
        image = "./assets/ship1.png",
        health = 50,
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        registery,
        onKill
    }) {
        super({
            element,
            size,
            image,
            health,
            velocity,
            boundaries,
            origin: {
                x: (boundaries.x - size.width) * .5,
                y: ((boundaries.y * -1) + size.height) * .5
            },
            defaultOrientation: 0,
            registery,
            onKill
        })
        this.element.classList.add('ship')
        this.rotationFactor = .3
        window.addEventListener('keydown', e => this.listenKey(e, true))
        window.addEventListener('keyup', e => this.listenKey(e, false))
        this.keyDownLoop()
    }
    piClock(i) {
        var r = i
        if (r > 0) {
            r = r % (2 * Math.PI)
        } else if (r < 0) {
            r = 2 * Math.PI - ((-1 * r) % (2 * Math.PI))
        }
        return Math.round(r * 100) / 100
    }
    keyDownLoop() {
        if (this.killed) return false
        if (this.collisionCheck(this.coordinate)) return
        const newCoordinates = { ...this.coordinate }
        if (this.activeKeys.UP) {
            newCoordinates.y += this.velocity / 5
        }
        if (this.activeKeys.DOWN) {
            newCoordinates.y -= this.velocity / 5
        }
        if (this.activeKeys.RIGHT) {
            newCoordinates.x += this.velocity / 5
        }
        if (this.activeKeys.LEFT) {
            newCoordinates.x -= this.velocity / 5
        }
        if (this.activeKeys.SPACE) {
            --this.fireCooldown
            if (!this.fireCooldown) {
                this.fire()
                this.fireCooldown =5
            }
        }
        var tan = Math.atan((newCoordinates.x - this.coordinate.x) / (newCoordinates.y - this.coordinate.y))
        if ((newCoordinates.y - this.coordinate.y) < 0) {
            tan -= Math.PI
        }
        if (Object.values(this.activeKeys).includes(true)) {
            var r = this.piClock(tan)
            var s = this.orientation
            if (r > s) {
                if ((r - s) > Math.PI) {
                    s -= this.rotationFactor
                } else {
                    s = Math.min(s + this.rotationFactor, r)
                }
            } else if (r !== s) {
                if ((s - r) > Math.PI) {
                    s += this.rotationFactor
                } else {
                    s = Math.max(s - this.rotationFactor, r)
                }
            }
            this.orientation = this.piClock(s) || this.orientation
            this.rotate()
            if (this.canMove(newCoordinates)) {
                this.positioned(newCoordinates)
            }
        }
        reqFrame(() => reqFrame(() => this.keyDownLoop()))
    }
    fire() {
        const div = document.createElement('div')
        this.element.parentElement.append(div)
        new Laser({
            origin: this.coordinate,
            vector: {
                x: Math.sin(this.orientation),
                y: Math.cos(this.orientation),
            },
            element: div,
            boundaries: this.boundaries,
            registery: this.registery
        })
    }
    listenKey(e, val) {
        if (this.killed) return false
        switch (e.keyCode) {
            case 38:
                this.activeKeys.UP = val
                break;
            case 39:
                this.activeKeys.RIGHT = val
                break;
            case 40:
                this.activeKeys.DOWN = val
                break;
            case 32:
                this.activeKeys.SPACE = val
                break;
            case 37:
                this.activeKeys.LEFT = val
                break;
        }
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
        if (
            points
                .map(a => document.elementFromPoint(a.x, -1 * a.y)?.classList.contains('asteroid'))
                .includes(true)
        ) {
            this.kill()
            return true
        }
    }
}