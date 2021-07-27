class Movable {

    constructor({
        element,
        size = { width: 100, height: 100 },
        image = "./assets/ship1.png",
        health = 50,
        velocity = 50,
        boundaries = { x: 1000, y: 1000 },
        origin = {x:0, y:0},
        defaultOrientation = 0,
        registery
    }) {
        this.element = element
        this.registery = registery
        registery.push(this)
        this.element.style.position = "absolute"
        this.element.style.width = size.width+'px'
        this.element.style.height = size.height+'px'
        this.element.style.backgroundImage = `url("${image}")`
        this.element.classList.add('movable')
        this.size = size
        this.health = health
        this.velocity = velocity
        this.boundaries = boundaries
        this.orientation =  defaultOrientation
        this.rotate
        this.positioned(origin)
    }

    canMove({x,y}){
        if(x < 0 || y > 0){
            return false
        }
        const right = x + this.size.width
        const bottom = this.size.height - y
        if(right > this.boundaries.x || bottom > this.boundaries.y){
            return false
        }
        return true
    }

    rotate() {
        this.element.style.transform = `rotate(${this.orientation}rad)`
    }
    kill(){
        this.registery.splice(this.registery.findIndex(a=>a===this),1)
        this.element.parentElement.removeChild(this.element)
    }

    positioned({x,y}) {
        this.coordinate = { x, y }
        this.element.style.top = `${-1 * y}px`
        this.element.style.left = `${x}px`
    }
}