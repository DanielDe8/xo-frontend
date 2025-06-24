<script>
	import { goto } from "$app/navigation"

    export let username
    export let email
    export let isAdmin

    export let rankedGames
    export let rankedWins
    export let rankedLosses

    export let randomGames
    export let randomWins
    export let randomLosses

    let admin = isAdmin ? 'Yes' : 'No'
</script>

<h2 class="text-3xl font-bold text-center mb-6">Your Profile</h2>

<div class="space-y-4 mb-3">
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
<div class="mb-3">
    <div class="flex justify-between">
        <span class="font-semibold">Ranked games:</span>
        <span>{ rankedGames }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Ranked wins:</span>
        <span>{ rankedWins }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Ranked losses:</span>
        <span>{ rankedLosses }</span>
    </div>
</div>
<div>
    <div class="flex justify-between">
        <span class="font-semibold">Random games:</span>
        <span>{ randomGames }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Random wins:</span>
        <span>{ randomWins }</span>
    </div>
    <div class="flex justify-between">
        <span class="font-semibold">Random losses:</span>
        <span>{ randomLosses }</span>
    </div>
</div>