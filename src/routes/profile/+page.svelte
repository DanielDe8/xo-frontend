<script>
    import Profile from "$lib/components/Profile.svelte"
    import { onMount } from "svelte"
    import { get } from "svelte/store"
	import { goto } from "$app/navigation"
    import { userStore } from "$lib/stores"
    import { SERVER_URL, API_METHOD } from "$lib/util"
	import { authenticate } from "$lib/auth"

    let logoutError = ""

    function logout() {
        fetch(SERVER_URL + "/auth", API_METHOD("DELETE")).then(async res => {
            if (res.ok) {
                userStore.set(null)
                goto("/")
            } else {
                logoutError = "Logout failed: " + await res.text()
            }
        })
    }

    onMount(() => {
        authenticate()
        if (!get(userStore)) goto("/login")
    })
</script>

<div class="card max-w-md mx-auto bg-base-200 shadow-lg p-8 mt-12">
    <div class="mb-4">
        <Profile { ...$userStore }/>
    </div>

    <button class="btn btn-error w-full" on:click={ logout }>
        Log Out
    </button>

    {#if logoutError}
        <span class="text-error text-sm block text-center mt-2">{logoutError}</span>
    {/if}
</div>