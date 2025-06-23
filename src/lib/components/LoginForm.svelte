<script>
	import { goto } from "$app/navigation"
    import { SERVER_URL, API_METHOD } from "$lib/util.js"
    import { userStore } from "$lib/stores"

    export let useRegister

    let loginError = ""

    function login(e) {
        const data = Object.fromEntries(new FormData(e.target))

        fetch(SERVER_URL + "/auth", { ...API_METHOD("POST"), body: JSON.stringify(data) }).then(async res => {
            if (res.status == 200) {
                res.json().then(user => {
                    userStore.set(user)
                    goto("/profile")
                })
            } else {
                loginError = "Login failed: " + await res.text()
            }
        })
    }
</script>

<div class="card shadow-lg bg-base-200 p-8 w-full max-w-md">
    <h1 class="text-3xl font-bold text-center mb-6">Log in</h1>

    <form class="space-y-4" on:submit|preventDefault={ login }>
        <label class="form-control w-full">
            <span class="label-text">Email</span>
            <input name="email" type="email" placeholder="a@b.com" class="input input-bordered w-full mb-3" required />
        </label>

        <label class="form-control w-full">
            <span class="label-text">Password</span>
            <input name="password" type="password" class="input input-bordered w-full mb-4" required />
        </label>

        <input type="submit" value="Login" class="btn btn-primary w-full" />
    </form>

    <p class="text-sm text-center mt-4">
        Don't have an account?
        <button on:click={ () => { useRegister = false; useRegister = true } /* force update */ } class="link link-hover text-accent">Register</button>
    </p>

    <span class="text-error text-sm block text-center mt-2">{ loginError }</span>
</div>