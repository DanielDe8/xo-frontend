<script>
    import LoginForm from "$lib/components/LoginForm.svelte"
    import { onMount } from "svelte"

    onMount(() => {
        if (get(userStore)) goto("/login")
    })
</script>

<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
    <LoginForm />
</div>