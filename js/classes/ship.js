
class Ship extends Damageable {
    activeKeys = {
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false,
        SPACE: false
    }
    constructor({
        element,
        size = { width: 100, height: 100 },
        image = "./assets/ship1.png",
        health = 50,
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        registery,
        onKill,
        force = 10
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
        this.rotationFactor = .005
        this.rotationInertia = 1
        window.addEventListener('keydown', e => this.listenKey(e, true))
        window.addEventListener('keyup', e => this.listenKey(e, false))
        this.fireCount = 0
        this.fireCooldown = 1
        this.damageCooldown = 1
        this.maxDamageCooldown = 30
        this.force = force
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
        if (this.damageCooldown) this.damageCooldown--
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
                this.fire(!this.activeKeys.SHIFT)
                this.fireCooldown = 5
            }
        }
        var tan = Math.atan((newCoordinates.x - this.coordinate.x) / (newCoordinates.y - this.coordinate.y))
        if ((newCoordinates.y - this.coordinate.y) < 0) {
            tan -= Math.PI
        }
        if (Object.values(this.activeKeys).includes(true)) {
            var r = this.piClock(tan)
            var s = this.orientation
            var factor = this.rotationFactor * this.rotationInertia
            if (r > s) {
                if ((r - s) > Math.PI) {
                    s -= factor
                } else {
                    s = Math.min(s + factor, r)
                }
            } else if (r !== s) {
                if ((s - r) > Math.PI) {
                    s += factor
                } else {
                    s = Math.max(s - factor, r)
                }
            }
            s = this.piClock(s)
            if (this.orientation !== s) {
                this.rotationInertia = Math.max(1, Math.min(60, this.rotationInertia * 1.3))
            } else if (this.rotationInertia !== 1) {
                this.rotationInertia = Math.max(1, Math.min(60, this.rotationInertia / 1.3))
            }
            this.orientation = s || this.orientation
            this.rotate()
            if (this.canMove(newCoordinates)) {
                this.positioned(newCoordinates)
            }
        } else {
            this.rotationInertia = 1
        }
        reqFrame(() => reqFrame(() => this.keyDownLoop()))
    }
    fire(forward = true) {
        this.fireCount++
        const div = document.createElement('div')
        this.element.parentElement.append(div)
        var f = forward ? 1 : -1
        new Laser({
            origin: {
                x: this.coordinate.x + this.size.width * .5,
                y: this.coordinate.y - this.size.height * .5,
            },
            vector: {
                x: Math.sin(this.orientation) * f,
                y: Math.cos(this.orientation) * f,
            },
            element: div,
            boundaries: this.boundaries,
            registery: this.registery,
            force: this.force,
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
            case 16:
                this.activeKeys.SHIFT = val
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
            // this.kill(true)
            this.takeDamage(10)
            return this.health === 0
        }
    }
    kill(prevent = false) {
        if (this.killed) return false
        this.registery.splice(this.registery.findIndex(a => a === this), 1)
        this.element.style.backgroundImage = `url("/assets/explosion.gif")`
        setTimeout(() => {
            this.element.parentElement.removeChild(this.element)
        }, 1000)
        this.killed = true
        if (prevent) {
            this.onKill?.()
        }
    }
    setHealth(hp) {
        console.log(this.health, hp)
        super.setHealth(hp)
        this.element.style.borderColor = `rgba(0, 140, 255, ${this.health / this.maxHealth})`
    }
    takeDamage(hitPoints) {
        if (!this.damageCooldown) {
            this.damageCooldown = this.maxDamageCooldown
            super.takeDamage(hitPoints)
        }
    }
}