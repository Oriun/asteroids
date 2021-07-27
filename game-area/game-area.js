

window.onload = ()=>{
    console.log(window.screen)
    window.ObjectList = []
    const boundaries = {
        x:window.screen.width,
        y: window.screen.height
    }
    new Ship({
        element:document.querySelector('#ship'),
        boundaries,
        registery: window.ObjectList
    })
    
    const spawnNb = 5
    const spawnInterval = 5000
    setInterval(()=>{
        new Array(spawnNb).fill(1).map(a=>createAsteroid(window.ObjectList, boundaries))
    },spawnInterval)

    function createAsteroid(registery, boundaries){
        const div = document.createElement('div')
        document.querySelector('.game-area').append(div)
        var origin = { x: Math.floor(Math.random()*2000), y: -1*Math.floor(Math.random()*2000) }
        var vector = { x: (Math.floor(Math.random()*20) / 20) - .5}
        vector.y = Math.round(Math.random()) ? (1 - vector.x) : ( - 1 + vector.x)
        var state = Math.round(Math.round(Math.random() * 20) / 10)

        return new GrandAsteroid({
            element: div,
            registery,
            boundaries,
            origin,
            vector,
            state
        })
    }
}