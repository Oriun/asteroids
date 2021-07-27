
class Ship  extends Movable{
    activeKeys ={
        LEFT : false,
        RIGHT : false,
        UP : false,
        DOWN : false
    }
    constructor({
        element,
        size = { width: 100, height: 100 },
        image = "./assets/ship1.png",
        health = 50,
        velocity = 50,
        boundaries = { x: 1000, y: 1000},
        registery
    }) {
        super({
            element,
            size,
            image,
            health,
            velocity,
            boundaries,
            origin : {
                x: (boundaries.x - size.width)* .5,
                y:((boundaries.y * -1) + size.height) * .5
            },
            defaultOrientation : 0,
            registery
        })
        this.element.classList.add('ship')
        window.addEventListener('keydown', e=>this.listenKey(e, true))
        window.addEventListener('keyup', e=>this.listenKey(e, false))
        this.keyDownLoop()
    }
    keyDownLoop(){
        const newCoordinates = {...this.coordinate}
        if(this.activeKeys.UP){
            newCoordinates.y += this.velocity / 5
        }
        if(this.activeKeys.DOWN){
            newCoordinates.y -= this.velocity / 5
        }
        if(this.activeKeys.RIGHT){
            newCoordinates.x += this.velocity / 5
        }
        if(this.activeKeys.LEFT){
            newCoordinates.x -= this.velocity / 5
        }
        var tan = Math.atan((newCoordinates.x - this.coordinate.x) / (newCoordinates.y - this.coordinate.y))
        if((newCoordinates.y - this.coordinate.y) < 0 ){
            tan -= Math.PI
        }
        if(Object.values(this.activeKeys).includes(true)){
            this.orientation = tan
            this.rotate()
            if(this.canMove(newCoordinates)){
                this.positioned(newCoordinates)
            }
        }
        reqFrame(()=>reqFrame(()=>this.keyDownLoop()))
    }
    listenKey(e, val) {
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
            case 37:
                this.activeKeys.LEFT = val
                break;
        }
    }
}