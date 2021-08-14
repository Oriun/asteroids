class Sprite {
    constructor({
        arena,
        width,
        height,
        image,
        id
    }) {
        this.arena = arena
        this.element = document.createElement('div')
        this.element.style.position = 'absolute'
        this.element.style.width = width + 'px'
        this.element.style.height = height + 'px'
        this.element.style.borderRadius = '50%'
        this.arena.append(this.element)
        this.id = id
    }
    kill() {
        this.arena.removeChild(this.element)
    }
    setImage(image) {
        if (image) {
            // this.element.style.backgroundColor = 'initial'
            this.element.style.background = `url("${image}")`
            this.element.style.backgroundSize = "contain"
            this.element.style.backgroundPosition = "center"
            this.element.style.backgroundRepeat = "no-repeat"
        }
        else this.element.style.backgroundColor = 'blue'
    }
    rotate(angle) {
        this.element.style.transform = `rotate(${angle}rad)`

    }
    positionned(x, y) {
        this.element.style.top = (-1 * y) + 'px'
        this.element.style.left = x + 'px'
    }
}