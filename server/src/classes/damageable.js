import { Movable } from "./movable.js"

export class Damageable extends Movable {

    constructor({
        size,
        health,
        velocity,
        boundaries,
        origin = {
            x: 0,
            y: 0
        },
        defaultOrientation = 0,
        registery,
        onKill,
        edges
    }) {
        super({
            size,
            velocity,
            boundaries,
            origin,
            defaultOrientation,
            registery,
            onKill,
            edges
        })
        this.maxHealth = health
        this.setHealth(this.maxHealth)
    }
    setHealth(hp) {
        this.health = Math.max(0, hp)
        if (!this.health) this.kill(true)
    }
    takeDamage(hitPoints) {
        this.setHealth(this.health - hitPoints)
    }
    serialize() {
        return {
            ...super.serialize(),
            health: Math.floor(this.health * 100 / this.maxHealth)
        }
    }
}