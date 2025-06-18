<script>
	import { onMount } from "svelte"
	import { goto } from "$app/navigation"
    import { gameInfoStore } from "$lib/stores.js"

    export let data

    onMount(() => {
        gameInfoStore.set({
            type: "friendly",
            gameCode: data.gameCode,
        })
        goto("/g")
    })
</script>