class GrandAsteroid extends Movable {

    constructor({
        element,
        registery,
        boundaries,
        size = { width: 50, height: 50 },
        state = 2,
        vector = { x: 1, y: 1 },
        velocity = 25,
        origin = { x: 1, y: 1 }
    }) {
        super({
            element,
            registery,
            size : {height: size.height * state, width: size.width * state},
            image: './assets/asteroid.png',
            origin
        })
        this.state = state
        this.vector = vector
        this.velocity = velocity
        this.element.classList.add("asteroid")
        this.startMoving()
    }


    startMoving() {
        if(this.killed) return
        const newCoordinate = {
            x: (this.vector.x * this.velocity / 10) + this.coordinate.x ,
            y: (this.vector.y * this.velocity / 10) + this.coordinate.y 
        }
        if(this.canMove(newCoordinate)){
            this.positioned(newCoordinate)
        }
        reqFrame(() => this.startMoving())
    }

    
    
    canMove({x,y}){
        if( x < -100 || y > -100){
            this.kill()
            return false
        }
        const right = x + this.size.width
        const bottom = this.size.height - y
        if(right > (this.boundaries.x + 100)  || bottom > (this.boundaries.y + 100)){
            this.kill()
            return false
        }
        return true
    }

    divide() {
        const div1 = document.createElement('div')
        const div2 = document.createElement('div')
        this.element.parentElement.append(div1)
        this.element.parentElement.append(div2)
        new GrandAsteroid({
            element: div1,
            registery: this.registery,
            boundaries: this.boundaries,
            size: this.size,
            state: --this.state,
            vector: this.vector,
            origin: this.coordinate
        })
        new GrandAsteroid({
            element: div2,
            registery: this.registery,
            boundaries: this.boundaries,
            size: this.size,
            state: --this.state,
            vector: this.vector,
            origin: this.coordinate
        })
        super.kill()
    }
    kill() {
        if (this.state === 1) {
            super.kill()
        } else {
            this.divide()
        }
    }
}
