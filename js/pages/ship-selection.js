
const search = window.location.search || ''
const params = Object.fromEntries(search.slice(1).split('&').map(a => a.split("=")))
const uname = params.u || localStorage.getItem("asteroid-uname")

function createCard({ name, img, id, health, velocity }) {
    return `
    <a href="/game-area/game-area.html?s=${id}&u=${uname}" class="ship-card">
        <h4>${name}</h4>
        <img src="${img}" id="ship-photo"/>
        <span>Health <img src="/assets/heart.svg" class="icon"/> : ${health}</span>
        <span>Speed <img src="/assets/speed.svg" class="icon"/> : ${velocity}</span>
    </a>
    `
}

window.onload = () => {
    document.getElementById("welcome-message").innerHTML = `Welcome ${uname}`
    const mappage = shipTypes.map(createCard)
    document.getElementById("shipContainer").innerHTML = mappage.join("")
}