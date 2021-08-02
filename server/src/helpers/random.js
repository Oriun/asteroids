
var counter = 0

export function randomInteger({ min = 0, max = 1 } = { min: 0, max: 1 }) {
    return min + Math.floor(Math.random() * (max - min))
}

export function idGenerator() {

    return (
        Math.floor(Date.now() / 1000).toString(16)

        + randomInteger({ max: 100000000000 }).toString(16).padStart(10, '0')

        + (++counter).toString(16).padStart(6, '0')
    )

}