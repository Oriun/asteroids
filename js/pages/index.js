window.onload = function () {
    const input = document.querySelector('#uname')
    const button = document.querySelector('#start')

    var username = ''
    var valid = false
    function setValid(a) {
        valid = a
        // button.disabled = !valid
    }

    function submit() {
        if (!valid) {
            window.alert('Votre pseudo doit comporter au moins 4 caractères et être composé de chiffres, lettres ou des caractères spéciaux suivants -_$?#@')
        } else {
            localStorage.setItem("asteroid-uname", username)
            window.open("/ship-selection.html?u=" + username, '_self')
        }
    }

    input.onchange = function ({ target: { value } }) {
        username = value
        setValid(/^[a-zA-Z0-9-_$?#@]{4,}$/g.test(value))
    }
    input.onkeydown = function ({ key }) {
        if (key === "Enter") {
            submit()
        }
    }
    button.onclick = submit
}