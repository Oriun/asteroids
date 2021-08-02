class Timer {
    constructor(element) {
        this.current = 0
        this.element = element
        this.interval = null
        this.update()
    }
    stop() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
    }
    start() {
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.current++
                this.update()
            }, 1000)
        }
    }
    update() {
        this.element.textContent = this.format(this.current)
    }
    format(sec) {
        var m = Math.floor(sec / 60)
        var s = sec % 60
        return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0')
    }
}