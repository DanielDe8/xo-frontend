<script>
	import { onMount } from "svelte"
    import { userStore } from "$lib/stores"
    import xImgSrc from "$lib/assets/x.svg"
    import oImgSrc from "$lib/assets/o.svg"

    export let player1, player2, xes, os, xNumber, type, last, winLine, status, playerDisconnected, dateStarted

    const allMoves = [...xes, ...os]

    const BG_COLOR = "#BEBAB6"
    const LAST_COLOR = "#6C6660"

    const X_IMG = new Image()
    const O_IMG = new Image()
    const STONE_SCALE = 0.8

    const player1Username = player1?.username || "Guest"
    const player2Username = player2?.username || "Guest"

    console.log({player1, player2, player1Username, player2Username})

    let myNumber = player1Username == $userStore.username ? 0 : 1

    let opponentUsername = myNumber == 0 ? player2Username : player1Username

    let myChar = myNumber == xNumber ? 'X' : 'O'
    let opponentChar = myNumber == xNumber ? 'O' : 'X'

    let iWon = myNumber == xNumber ? (status == 0) : (status == 1)

    let typeText = (type == "g" ? "Random" : (type == "f" ? "Friendly" : "ranked"))
    let disconnectText = playerDisconnected ? "Yes" : "No"

    let renderCanvas = allMoves.length > 0

    let canvas
    let ctx

    let W = 0
    let H = 0
    $: if (canvas) {
        const rect = canvas.getBoundingClientRect()

        W = canvas.width = rect.width
        H = canvas.height = rect.height
    }

    onMount(() => {
        if (!canvas) return
        ctx = canvas.getContext("2d")

        X_IMG.src = xImgSrc
        O_IMG.src = oImgSrc

        X_IMG.onload = O_IMG.onload = drawAll

        function drawAll() {
            const xPos = allMoves.map(m => m.x)
            const yPos = allMoves.map(m => m.y)

            const minX = Math.min(...xPos)
            const minY = Math.min(...yPos)
            const maxX = Math.max(...xPos)
            const maxY = Math.max(...yPos)

            const padding = 1

            const gridWidth = (maxX - minX) + (padding * 2) + 1
            const gridHeight = (maxY - minY) + (padding * 2) + 1

            const gridSize = Math.max(gridWidth, gridHeight)

            const cellSize = Math.min(W, H) / gridSize

            ctx.fillStyle = BG_COLOR
		    ctx.fillRect(0, 0, W, H)

            drawStones()
            drawWinLine()
            drawGrid()

            function drawGrid() {
                ctx.strokeStyle = "#000"
                ctx.lineWidth = 1
                for (let i = 0; i <= gridSize; i++) {
                    const x = i * cellSize
                    ctx.beginPath()
                    ctx.moveTo(x, 0)
                    ctx.lineTo(x, gridSize * cellSize)
                    ctx.stroke()
                }
                for (let j = 0; j <= gridSize; j++) {
                    const y = j * cellSize
                    ctx.beginPath()
                    ctx.moveTo(0, y)
                    ctx.lineTo(gridSize * cellSize, y)
                    ctx.stroke()
                }
            }

            function drawStones() {
                for (const xx of xes) {
                    drawStone(xx.x, xx.y, X_IMG)
                }

                for (const o of os) { 
                    drawStone(o.x, o.y, O_IMG)
                }

                function drawStone(x, y, img) {
                    ctx.drawImage(img, (x - minX + padding + (1 - STONE_SCALE) / 2) * cellSize, (y - minY + padding + (1 - STONE_SCALE) / 2) * cellSize, cellSize * STONE_SCALE, cellSize * STONE_SCALE)
                }
            }

            function drawWinLine() {
                ctx.save();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(
                    (winLine.a.x - minX + padding + 0.5) * cellSize,
                    (winLine.a.y - minY + padding + 0.5) * cellSize
                );
                ctx.lineTo(
                    (winLine.b.x - minX + padding + 0.5) * cellSize,
                    (winLine.b.y - minY + padding + 0.5) * cellSize
                );
                ctx.stroke();
                ctx.restore();
            }
        }
    })
</script>

<div class="card bg-base-200 mb-4 p-4 shadow-md">
    <h3 class="text-xl font-semibold mb-2">
        <span class:text-success={ iWon } class:text-error={ !iWon }>{ myChar}: { $userStore.username }</span> vs 
        <span class:text-success={ !iWon } class:text-error={ iWon }>{ opponentChar }: { opponentUsername }</span>
    </h3>
    <p class="text-sm text-gray-600">Loss by disconnection? { disconnectText }</p>
    <p class="text-sm text-gray-600">Type: { typeText }</p>
    <p class="text-sm text-gray-400">Created at: { new Date(dateStarted).toLocaleString() }</p>
    {#if renderCanvas}
        <div class="aspect-square">
            <canvas bind:this={ canvas } class="w-full h-full"></canvas>
        </div>
    {/if}
</div>