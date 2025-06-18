<script>
	import { goto } from "$app/navigation"

    export let username
    export let email
    export let isAdmin

    let admin = isAdmin ? 'Yes' : 'No'
</script>

<h2 class="text-3xl font-bold text-center mb-6">Your Profile</h2>

<div class="space-y-4">
    <div class="flex justify-between">
        <span class="font-semibold">Username:</span>
        <span>{ username }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Email:</span>
        <span>{ email }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Admin?</span>
        <span>{ admin }</span>
    </div>
</div>
