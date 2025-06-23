<script>
    import LoginForm from "$lib/components/LoginForm.svelte"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"

    let useRegister

    $: if (useRegister) goto("/register")

    onMount(() => {
        if (get(userStore)) goto("/register")
    })
</script>

<main class="min-h-screen overflow-y-auto flex items-center justify-center px-4 py-12">
    <LoginForm bind:useRegister/>
</main>