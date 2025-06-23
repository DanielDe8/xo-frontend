<script>
    import LoginForm from "$lib/components/LoginForm.svelte"
	import RegisterForm from "$lib/components/RegisterForm.svelte"
    import { onMount } from "svelte"
    import { get } from "svelte/store"
	import { goto } from "$app/navigation"
    import { SERVER_URL, API_METHOD, isGameCodeValid, joinGame } from "$lib/util.js"
    import { userStore, gameInfoStore } from "$lib/stores.js"

    let useLogin         // for the component
    let useRegister      // for the component
    let showLogin = true // for the UI

    $: if (useLogin) { 
        showLogin = true
    }
    $: if (useRegister) {
        showLogin = false
    }

    let isLoaded = false
    let recentGames = []

    let gameCodeInput = ""
    let joinError = ""

    function joinFriendly() {
        if (!isGameCodeValid(gameCodeInput)) {
            joinError = "Invalid game code format. Please use a 6-letter code."
            return
        }
        joinGame("friendly", gameCodeInput)
    }
    function createFriendly() { joinGame("create") }
    function playRandom() { joinGame("random") }

    onMount(() => {
        fetch(SERVER_URL + "/api/recent", API_METHOD("GET")).then((res) => {
            if (res.status == 200) {
                res.json().then((data) => { 
                    recentGames = data
                    isLoaded = true
                })
            } else {
                console.error("Failed to load recent games:", res.status, res.statusText)
                isLoaded = true
            }
        })
    })
</script>


<main class="flex flex-col md:flex-row h-[100dvh] overflow-y-auto overscroll-contain">
    <!-- Left: Play section -->
    <section class="flex-1 p-4 sm:p-6 space-y-6 overflow-auto min-h-[100svh]">
        <h1 class="text-5xl font-bold text-center mb-6">Play <span class="text-6xl">xo</span></h1>

        <div class="card bg-base-200 p-6 shadow-md">
            <h2 class="text-2xl font-semibold mb-4">🎮 Friendly Match</h2>
            <div class="flex flex-wrap gap-2 items-center mb-3">
                <input bind:value={ gameCodeInput } class="input input-bordered flex-1" type="text" placeholder="Enter game code..." />
                <button on:click={ joinFriendly } class="btn btn-primary flex-1">Join</button>
            </div>
            <button on:click={ createFriendly } class="btn btn-secondary w-full">Create New Game</button>
            <p class="text-error text-sm mt-2">{ joinError }</p>
        </div>

        <div class="card bg-base-200 p-6 shadow-md">
            <h2 class="text-2xl font-semibold mb-4">🏆 Ranked (COMING SOON!)</h2>
            <div class="flex flex-wrap gap-2 items-center mb-3">
                <div class="flex-1">
                    <button disabled class="btn btn-accent w-full mb-3" id="joinGameClassic">⏱️ Play Classic</button>
                    <div class="flex justify-center">
                        <span class="badge badge-outline" id="eloClassic">ELO: ???</span>
                    </div>
                </div>
                <div class="flex-1">
                    <button disabled class="btn btn-accent w-full mb-3" id="joinGameBlitz">⚡ Play Blitz</button>
                    <div class="flex justify-center">
                        <span class="badge badge-outline content-center" id="eloBlitz">ELO: ???</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="card bg-base-200 p-6 shadow-md">
            <h2 class="text-2xl font-semibold mb-4">🎲 Random Match</h2>
            <button on:click={ playRandom } class="btn btn-info w-full">Play Random</button>
        </div>

        <div class="pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]"></div>
    </section>

    <!-- Right: login or recent games -->
    <section class="hidden md:block w-full md:w-1/2 border-t md:border-t-0 md:border-l border-base-300 p-4 sm:p-6 overflow-y-auto">
        {#if $userStore}
            {#if isLoaded}
                {#if recentGames.length > 0}
                    <h2 class="text-3xl font-semibold mb-4">Recent Games</h2>

                    {#each recentGames as { player1, player2, status, createdAt }}
                        <div class="card bg-base-200 mb-4 p-4 shadow-md">
                            <h3 class="text-xl font-semibold mb-2">Recent Game</h3>
                            <p class="text-sm text-gray-600">Players: {player1} vs {player2}</p>
                            <p class="text-sm text-gray-600">Status: {status}</p>
                            <p class="text-sm text-gray-400">Created at: {new Date(createdAt).toLocaleString()}</p>
                        </div>
                    {/each}
                {:else}
                    <h2 class="text-3xl font-semibold mb-4">No Recent Games</h2>
                {/if} 
            {:else}
                <h2 class="text-3xl font-semibold mb-4">Loading Recent Games...</h2>
            {/if}
        {:else}
            <div class="flex flex-col justify-center items-center h-full">
                <div class="max-w-md mx-auto">
                    {#if showLogin}
                        <LoginForm bind:useRegister/>
                    {:else}
                        <RegisterForm bind:useLogin/>
                    {/if}
                </div>
            </div>
        {/if}
    </section>
</main>
