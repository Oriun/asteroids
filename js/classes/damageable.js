class Damageable extends Movable {

    constructor({
        element,
        size,
        image,
        health,
        velocity,
        boundaries,
        origin = {
            x: 0,
            y: 0
        },
        defaultOrientation = 0,
        registery,
        onKill
    }) {
        super({
            element,
            size,
            image,
            velocity,
            boundaries,
            origin,
            defaultOrientation,
            registery,
            onKill
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
}