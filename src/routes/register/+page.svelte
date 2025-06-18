<script>
    import { onMount } from "svelte"
	import { goto } from "$app/navigation"
    import { SERVER_URL, API_METHOD } from "$lib/util"
    import { userStore } from "$lib/stores"

    let registerError = ""

    function register(e) {
        const data = Object.fromEntries(new FormData(e.target))

        fetch(SERVER_URL + "/auth/register", { ...API_METHOD("POST"), body: JSON.stringify(data) }).then(async res => {
            if (res.status == 200) {
                res.json().then(user => {
                    userStore.set(user)
                    goto("/profile")
                })
            } else {
                registerError = "Register failed: " + await res.text()
            }
        })
    }

    onMount(() => {
        if (get(userStore)) goto("/login")
    })
</script>

<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="card shadow-lg bg-base-200 p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8">Register</h1>

        <form class="space-y-5" on:submit|preventDefault={ register }>
            <label class="form-control w-full">
                <span class="label-text">Username</span>
                <input name="username" type="text" placeholder="Player123..." class="input input-bordered w-full mb-3" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Email</span>
                <input name="email" type="email" placeholder="a@b.com" class="input input-bordered w-full mb-3" required />
            </label>

            <label class="form-control w-full">
                <span class="label-text">Password</span>
                <input name="password" type="password" class="input input-bordered w-full mb-4" required />
            </label>

            <input type="submit" value="Register" class="btn btn-primary w-full" />
        </form>

        <p class="text-sm text-center mt-6">
            Already have an account?
            <a href="/login" class="link link-hover text-accent">Login</a>
        </p>

        <span class="text-error text-sm block text-center mt-4">{ registerError }</span>
    </div>
</div>