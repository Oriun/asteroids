
const search = window.location.search || ''
const params = Object.fromEntries(search.slice(1).split('&').map(a => a.split("=")))
const ship = shipTypes.find(a => a.id == params.s)

if (!ship) {
    console.log(params)
    window.open('/', '_self')
}
window.onload = () => {
    const clock = new Timer(document.querySelector('#clock'))
    clock.start()
    window.ObjectList = []
    const boundaries = {
        x: document.querySelector('.game-area').getBoundingClientRect().width,
        y: document.querySelector('.game-area').getBoundingClientRect().height
    }
    new Ship({
        element: document.querySelector('#ship'),
        boundaries,
        registery: window.ObjectList,
        onKill: () => {
            clearInterval(interval);
            [...window.ObjectList].forEach(a => a.forceKill())
            clock.stop()
            window.alert('game over')
            window.location.reload()
        }
    })

    const spawnNb = 5
    const spawnInterval = 3000
    var interval = setInterval(() => {
        new Array(spawnNb).fill(1).map(createAsteroid)
    }, spawnInterval)

    var killCount = -1
    const counter = document.querySelector('#counter')
    function incrementKillCount() {
        counter.textContent = ++killCount + ' Kill'
    }
    incrementKillCount()
    function randBool(ratio = .5) { return Math.random() <= ratio }

    function randomAsteroidCoordinates() {
        var x = -100
        var y = 100

        if (randBool()) { // free on x axis
            if (randBool()) {
                x = boundaries.x * Math.random()
            }
            if (randBool()) {
                y = boundaries.y * -1
            }
        } else {
            if (randBool()) {
                x = boundaries.x
            }
            if (randBool()) {
                y = boundaries.y * -1 * Math.random()
            }
        }
        return { x, y }
    }
    function randDirection({ x: originX, y: originY }) {
        var x = Math.random()
        var y = 1 - x
        if (originX > 0) x *= -1
        if (originY > 0) y *= -1
        return { x, y }
    }
    function createAsteroid() {
        const div = document.createElement('div')
        document.querySelector('.game-area').append(div)
        var origin = randomAsteroidCoordinates()
        var vector = randDirection(origin)
        var state = randBool(.2) ? 3 : randBool(.8) ? 2 : 1

        return new GrandAsteroid({
            element: div,
            registery: window.ObjectList,
            boundaries,
            origin,
            vector,
            state,
            onKill: () => incrementKillCount()
        })
    }
}