<script>
    import { userStore } from "$lib/stores"

    export let player1, player2, xes, os, xNumber, type, last, winLine, status, playerDisconnected, dateStarted

    let myNumber = player1.username == $userStore.username ? 0 : 1

    let opponentUsername = myNumber == 0 ? player2.username : player1.username

    let myChar = myNumber == xNumber ? 'X' : 'O'
    let opponentChar = myNumber == xNumber ? 'O' : 'X'

    let iWon = myNumber == xNumber ? (status == 0) : (status == 1)

    let typeText = (type == "g" ? "Random" : (type == "f" ? "Friendly" : "ranked"))
    let disconnectText = playerDisconnected ? "Yes" : "No"
</script>

<div class="card bg-base-200 mb-4 p-4 shadow-md">
    <h3 class="text-xl font-semibold mb-2">
        <span class:text-success={ iWon } class:text-error={ !iWon }>{ myChar}: { $userStore.username }</span> vs 
        <span class:text-success={ !iWon } class:text-error={ iWon }>{ opponentChar }: { opponentUsername }</span>
    </h3>
    <p class="text-sm text-gray-600">Loss by disconnection? { disconnectText }</p>
    <p class="text-sm text-gray-600">Type: { typeText }</p>
    <p class="text-sm text-gray-400">Created at: { new Date(dateStarted).toLocaleString() }</p>
</div>