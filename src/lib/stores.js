import { writable } from "svelte/store"

const userStore = writable(null)
const gameInfoStore = writable(null)

export { userStore, gameInfoStore }