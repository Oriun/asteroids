import { Damageable } from './damageable.js'
import { Laser } from './laser.js'
import { intersect } from './edges.js'
// import Polygon, { rotateAround } from './polygon.js'
export class Ship extends Damageable {
    activeKeys = {
        LEFT: false,
        RIGHT: false,
        UP: false,
        DOWN: false,
        SHOOT: false,
        BACKWARD: false,
        SPECIAL: false
    }
    constructor({
        size = { width: 100, height: 100 },
        health = 50,
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        registery,
        onKill,
        force = 10,
        id,
        edges
    }) {
        super({
            size,
            health,
            velocity,
            boundaries,
            origin: {
                x: (boundaries.x - size.width) * .5,
                y: (boundaries.y - size.height) * .5
            },
            defaultOrientation: 0,
            registery,
            onKill,
            edges
        })
        this.shipId = id
        this.rotationFactor = .005
        this.rotationInertia = 1
        this.fireCount = 0
        this.fireCooldown = 1
        this.damageCooldown = 1
        this.maxDamageCooldown = 30
        this.force = force

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
    loop() {
        if (this.killed) return false
        if (this.collisionCheck()) return
        if (this.damageCooldown) this.damageCooldown--
        const newCoordinates = { ...this.coordinate }
        if (this.activeKeys.UP) {
            newCoordinates.y -= this.velocity / 5
        }
        if (this.activeKeys.DOWN) {
            newCoordinates.y += this.velocity / 5
        }
        if (this.activeKeys.RIGHT) {
            newCoordinates.x += this.velocity / 5
        }
        if (this.activeKeys.LEFT) {
            newCoordinates.x -= this.velocity / 5
        }
        if (this.activeKeys.SHOOT) {
            --this.fireCooldown
            if (!this.fireCooldown) {
                this.fire(!this.activeKeys.BACKWARD)
                this.fireCooldown = 12
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
                this.rotate(s)
            } else if (this.rotationInertia !== 1) {
                this.rotationInertia = Math.max(1, Math.min(60, this.rotationInertia / 1.3))
            }
            if (this.canMove(newCoordinates)) {
                this.positioned(newCoordinates)
            }
        } else {
            this.rotationInertia = 1
        }
    }
    fire(forward = true) {
        this.fireCount++
        var f = forward ? 1 : -1
        var _ = new Laser({
            origin: {
                x: this.coordinate.x + this.size.width * .5,
                y: this.coordinate.y + this.size.height * .5,
            },
            vector: {
                x: Math.sin(this.orientation) * f,
                y: Math.cos(this.orientation) * f,
            },
            boundaries: this.boundaries,
            registery: this.registery,
            force: this.force,
            id: this.id
        })
    }
    setKeys({
        LEFT,
        RIGHT,
        UP,
        DOWN,
        SHOOT,
        BACKWARD,
        SPECIAL
    }) {
        this.activeKeys = {
            ...this.activeKeys,
            LEFT,
            RIGHT,
            UP,
            DOWN,
            SHOOT,
            BACKWARD,
            SPECIAL
        }
    }
    rotate(angle) {
        super.rotate(angle)
        this.rotationInertia = Math.max(1, Math.min(60, this.rotationInertia * 1.3))
    }
    collisionCheck() {
        var hit = this.registery.find(sprite => {
            if ((sprite.origin || sprite.id) === this.id) return false
            return sprite.edges && intersect(sprite.edges, this.edges)
        })
        if (hit) {
            console.log('hit', hit.id, hit.constructor?.name, this.health)
            this.takeDamage(10)
            return this.health === 0
        }
    }
    setHealth(hp) {
        // console.log(this.health, hp)
        super.setHealth(hp)
    }
    takeDamage(hitPoints) {
        if (!this.damageCooldown) {
            this.damageCooldown = this.maxDamageCooldown
            super.takeDamage(hitPoints)
        }
    }
    serialize() {
        return {
            ...super.serialize(),
            type: 'Ship' + this.shipId
        }
    }
    positioned(c) {
        super.positioned(c)
    }
}