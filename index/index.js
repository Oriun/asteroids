function startPlaying() {
    if (document.getElementById("username").value === "") {
        alert("Rentrez un username valide")
    }
    else {
        localStorage.setItem("username", document.getElementById("username").value)
        document.location.href = "../ship-selection/ship-selection.html"
    }

}