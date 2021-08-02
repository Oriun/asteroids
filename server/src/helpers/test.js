export function execTime(fn, it) {
    var hrTime = process.hrtime()
    const start = hrTime[0] * 1_000_000_000 + hrTime[1]
    for (let i = 0; i < it; i++) {
        fn()
    }
    var hrTime2 = process.hrtime()
    var end = hrTime2[0] * 1_000_000_000 + hrTime2[1]
    return (end - start) / it
}