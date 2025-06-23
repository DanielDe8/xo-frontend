<script>
    import "../app.css"
	import { onMount } from "svelte"
    import { authenticate } from "$lib/auth"
    import { userStore } from "$lib/stores"

	export let children

    let isLoaded = false

    onMount(() => {
        authenticate().then(() => {
            isLoaded = true
        })
    })

</script>

{#if isLoaded}
    <div class="font-[Varela_Round] h-screen overflow-y-auto md:overflow-hidden bg-base-100">
        <div class="navbar bg-base-200 shadow-lg px-4">
            <div class="navbar-start">
                <a class="btn btn-ghost text-4xl" href="/">xo</a>
            </div>
            <div class="navbar-end space-x-2">
                {#if $userStore}
                    <a class="btn btn-outline" href="/profile">Profile</a>
                {:else}
                    <a class="btn btn-outline" href="/login">Login</a>
                    <a class="btn btn-outline" href="/register">Register</a>
                {/if}            
            </div>
        </div>
        
        {@render children()}
    </div>
{/if}