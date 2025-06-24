import { SERVER_URL, API_METHOD } from "$lib/util"
import { userStore } from "$lib/stores"

async function authenticate() {
    const res = await fetch(SERVER_URL + "/auth", API_METHOD("GET"))
    if (res.status === 200) {
        const data = await res.json()
        userStore.set(data)
    } else {
        userStore.set(null)
    }
}

export { authenticate }