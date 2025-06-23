<script>
    import LoginForm from "$lib/components/LoginForm.svelte"
    import { onMount } from "svelte"

    onMount(() => {
        if (get(userStore)) goto("/login")
    })
</script>

<main class="min-h-screen overflow-y-auto flex items-center justify-center px-4 py-12">
    <LoginForm />
</main>