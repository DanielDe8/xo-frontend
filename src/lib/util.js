import { goto } from "$app/navigation"
import { gameInfoStore } from "$lib/stores"

const SERVER_URL = "https://xo-r.duckdns.org:9201"
// const SERVER_URL = "http://localhost:9201"
// const SERVER_URL = "http://192.168.1.209:9201"

function API_METHOD(method) {
    return {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    }
}

function isGameCodeValid(code) {
    return code.length == 6 && /^[A-Za-z0-9]*$/.test(code)
}

function joinGame(type, gameCode = null) {
    gameInfoStore.set({ type, gameCode })
    goto("/g")
}

function getTouchDistance(touches) {
    if (touches.length < 2) return 0
    const [t1, t2] = touches
    const dx = t2.clientX - t1.clientX
    const dy = t2.clientY - t1.clientY

    return Math.sqrt(dx * dx + dy * dy)
}

function getTouchCenter(touches) {
    if (touches.length < 2) return null
    const [t1, t2] = touches

    return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
    }
}

export { SERVER_URL, API_METHOD, isGameCodeValid, joinGame, getTouchDistance, getTouchCenter }
