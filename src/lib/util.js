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

export { SERVER_URL, API_METHOD, isGameCodeValid, joinGame }
