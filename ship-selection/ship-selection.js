window.onload = () => {
    document.getElementById("welcome-message").innerHTML = `Welcome ${localStorage.getItem("username")}`
    const mappage = shipArray.map(a => `<div class="ship-card"><h4>${a.name}</h4><ul><li><img src="${a.img}" /></li><li>Health <svg id="health" xmlns="http://www.w3.org/2000/svg"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"   d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg> : ${a.health}</li><li>Speed <svg xmlns="http://www.w3.org/2000/svg" id="speed" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
</svg> : ${a.velocity}</li></ul><a href="/game-area/game-area.html?ship=${a.ship}">Select</a></div>`)
    document.getElementById("shipContainer").innerHTML = mappage.join("")
}

const shipArray = [
    {
        name: "Bulk 3000",
        ship: 2,
        health: "5",
        velocity: "50 m/s",
        img: "../game-area/assets/ship2.png"
    },
    {
        name: "Speedo X-AE",
        ship: 1,
        health: "3",
        velocity: "200 m/s",
        img: "../game-area/assets/ship1.png"
    }
]