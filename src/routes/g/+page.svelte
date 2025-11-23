<script>
    import { io } from "socket.io-client"
	import { error } from "@sveltejs/kit"
	import { onMount } from "svelte"
	import { get } from "svelte/store"
	import { beforeNavigate, goto } from "$app/navigation"
    import { SERVER_URL, getTouchCenter, getTouchDistance } from "$lib/util"
    import { gameInfoStore } from "$lib/stores"
    import xImgSrc from "$lib/assets/x.svg"
    import oImgSrc from "$lib/assets/o.svg"

    const BG_COLOR = "#BEBAB6"
    const LAST_COLOR = "#6C6660"

    const X_IMG = new Image()
    const O_IMG = new Image()
    const STONE_SCALE = 0.8

    const CELL_S = 50

    const MIN_SCALE = 0.2
    const MAX_SCALE = 4

    const INIT_OFFSET = 5

    var gameState = null

    var gameCode = ""

    var playerNumber = -1

    var username = ""
    var opponentUsername = ""

    var offsetX = INIT_OFFSET * CELL_S
    var offsetY = INIT_OFFSET * CELL_S
    var scale = 1

    var isDragging = false
    var wasDragging = false
    var dragStart = { x: 0, y: 0 }

    var lastTouchDistance = 0
    var lastTouchCenter = null
    var isTouchPanning = false
    var touchStartTime = 0
    var touchStartPos = { x: 0, y: 0 }

    let canvas
    let ctx

    let statusText
    let errorText
    let turnText

    let socket

    let W = 0
    let H = 0
    $: if (canvas) {
        W = canvas.width
        H = canvas.height
    }

    let gameInfo

    onMount(() => {
        socket = io(SERVER_URL, {
            withCredentials: true
        })

        ctx = canvas.getContext("2d")

        requestAnimationFrame(() => {
            resizeCanvasToDisplaySize()
            drawAll()
        })

        X_IMG.src = xImgSrc
        O_IMG.src = oImgSrc

        socket.on("gameState", handleGameState)
        socket.on("preInit", handlePreInit)
        socket.on("init", handleInit)
        socket.on("firstMoveOffset", handleFirstMoveOffset)
        socket.on("joinGameError", msg => errorText = `Join error: ${msg}`)
        socket.on("invalidMove", msg => errorText = `Invalid move: ${msg}`)
        
        gameInfo = get(gameInfoStore)

        if (!gameInfo) gameInfo = { type: "home", gameCode: "" }

        if (gameInfo.type == "create") {
            socket.emit("createGame")
        } else if (gameInfo.type == "home") {
            goto("/")
        } else if (gameInfo.type != "rejoin") {
            socket.emit("joinGame", JSON.stringify({
                type: gameInfo.type,
                code: gameInfo.gameCode || ""
            }))
        }

        window.addEventListener("resize", resizeCanvasToDisplaySize)
        return () => window.removeEventListener("resize", resizeCanvasToDisplaySize)
    })

    beforeNavigate(() => {
        socket.disconnect()
    })

    function resizeCanvasToDisplaySize() {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        drawAll()
    }

    function mouseDown(e) {
        isDragging = true
        wasDragging = false
        dragStart.x = e.x - canvas.getBoundingClientRect().left
        dragStart.y = e.y - canvas.getBoundingClientRect().top
    }
    function mouseMove(e) {
        if (isDragging) {
            wasDragging = true

            const x = e.x - canvas.getBoundingClientRect().left
            const y = e.y - canvas.getBoundingClientRect().top

            offsetX += x - dragStart.x
            offsetY += y - dragStart.y

            dragStart = { x, y }

            drawAll()
        }
    }
    function mouseUp(e) {
        if (!wasDragging) {
            const x = e.x - canvas.getBoundingClientRect().left
            const y = e.y - canvas.getBoundingClientRect().top
            handleClick(x, y)
        }
        isDragging = false
        wasDragging = false
    }
    function mouseLeave() {
        isDragging = false
    }
    function mouseWheel(e) {const zoomIntensity = 0.1
        const zoom = 1 - Math.sign(e.deltaY) * zoomIntensity

        const newScale = scale * zoom

        if (newScale < MIN_SCALE || newScale > MAX_SCALE) return

        const rect = canvas.getBoundingClientRect()
        const mouseX = (e.clientX - rect.left - offsetX) / scale
        const mouseY = (e.clientY - rect.top - offsetY) / scale

        offsetX -= mouseX * (zoom - 1) * scale
        offsetY -= mouseY * (zoom - 1) * scale

        scale = newScale

        drawAll()
    }
    function handleClick(x, y) {
        if (x < 0 || y < 0 || x > W || y > H) return

        const gameX = Math.floor((x - offsetX) / scale / CELL_S)
        const gameY = Math.floor((y - offsetY) / scale / CELL_S)

        socket.emit("click", JSON.stringify({ x: gameX, y: gameY }))
    }

    function touchStart(e) {
        if (e.touches.length === 1) {
            isTouchPanning = true
            const x = e.touches[0].clientX - canvas.getBoundingClientRect().left
            const y = e.touches[0].clientY - canvas.getBoundingClientRect().top
            dragStart = { x, y }
            touchStartPos = { x, y }
            touchStartTime = Date.now()
        } else if (e.touches.length === 2) {
            isTouchPanning = false
            lastTouchDistance = getTouchDistance(e.touches)
            lastTouchCenter = getTouchCenter(e.touches)
        }
    }
    function touchMove(e) {
        if (e.touches.length === 1 && isTouchPanning) {
            const x = e.touches[0].clientX - canvas.getBoundingClientRect().left
            const y = e.touches[0].clientY - canvas.getBoundingClientRect().top

            offsetX += x - dragStart.x
            offsetY += y - dragStart.y

            dragStart = { x, y }

            drawAll()
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const currentDistance = getTouchDistance(e.touches)
            const zoom = currentDistance / lastTouchDistance

            const newScale = scale * zoom

            if (newScale < MIN_SCALE || newScale > MAX_SCALE) return

            const rect = canvas.getBoundingClientRect()
            const center = getTouchCenter(e.touches)

            const mouseX = (center.x - rect.left - offsetX) / scale
            const mouseY = (center.y - rect.top - offsetY) / scale

            offsetX -= mouseX * (zoom - 1) * scale
            offsetY -= mouseY * (zoom - 1) * scale

            scale = newScale

            lastTouchDistance = currentDistance
            lastTouchCenter = center

            drawAll()
        }
    }
    function touchEnd(e) {
        if (e.touches.length === 0) {
            const duration = Date.now() - touchStartTime
            const moved = Math.hypot(dragStart.x - touchStartPos.x, dragStart.y - touchStartPos.y)

            if (duration < 300 && moved < 10) {
                handleClick(touchStartPos.x, touchStartPos.y)
            }

            isTouchPanning = false
        } else if (e.touches.length === 1) {
            isTouchPanning = true
            dragStart.x = e.touches[0].clientX - canvas.getBoundingClientRect().left
            dragStart.y = e.touches[0].clientY - canvas.getBoundingClientRect().top
        }
    }

    function handleGameState(newGameStateString) {
        const newGameState = JSON.parse(newGameStateString)
        if (newGameState != gameState) errorText = ""

        gameState = newGameState
        drawAll()
    }
    function handlePreInit(code) {
        gameCode = code
        playerNumber = 0
        drawAll()
    }
    function handleInit(data) {
        gameState = JSON.parse(data)

        playerNumber *= -1 // if 0 then 0, if -1 (default) then 1 

        const u0 = gameState.usernames[0] || "Guest"
        const u1 = gameState.usernames[1] || "Guest";

        ([username, opponentUsername] = (playerNumber == 0 ? [u0, u1] : [u1, u0]))

        drawAll()
    }
    function handleFirstMoveOffset(offsetString) {
        const offset = JSON.parse(offsetString)

        offsetX += offset.x * CELL_S * scale
        offsetY += offset.y * CELL_S * scale

        drawAll()
    }

    function drawGrid() {
        ctx.lineWidth = 1 / scale
        ctx.strokeStyle = "black"
        ctx.beginPath()

        const startX = Math.floor(-offsetX / scale / CELL_S) - 1
        const endX = Math.ceil((W - offsetX) / scale / CELL_S) + 1
        const startY = Math.floor(-offsetY / scale / CELL_S) - 1
        const endY = Math.ceil((H - offsetY) / scale / CELL_S) + 1

        for (let i = startX; i <= endX; i++) {
            const x = Math.round(i * CELL_S) + 0.5 / scale
            ctx.moveTo(x, startY * CELL_S)
            ctx.lineTo(x, endY * CELL_S)
        }

        for (let j = startY; j <= endY; j++) {
            const y = Math.round(j * CELL_S) + 0.5 / scale
            ctx.moveTo(startX * CELL_S, y)
            ctx.lineTo(endX * CELL_S, y)
        }

        ctx.stroke()
    }


    function drawStones() {
        if (gameState.last.exists) {
            ctx.fillStyle = LAST_COLOR
            ctx.fillRect(gameState.last.x * CELL_S, gameState.last.y * CELL_S, CELL_S, CELL_S)
        }

        for (const xx of gameState.xes) { 
            // ctx.fillStyle = "blue"
            // ctx.fillRect((xx.x + 0.25) * CELL_S, (xx.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)

            drawStone(xx.x, xx.y, X_IMG)
        }

        for (const o of gameState.os) { 
            // ctx.fillStyle = "red"
            // ctx.fillRect((o.x + 0.25) * CELL_S, (o.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)

            drawStone(o.x, o.y, O_IMG)
        }

        function drawStone(x, y, img) {
            ctx.drawImage(img, (x + (1 - STONE_SCALE) / 2) * CELL_S, (y + (1 - STONE_SCALE) / 2) * CELL_S, CELL_S * STONE_SCALE, CELL_S * STONE_SCALE)
        }
    }

    function drawAll() {
        ctx.save()

        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, W, H)

        ctx.translate(offsetX, offsetY)
        ctx.scale(scale, scale)

        ctx.fillStyle = BG_COLOR
        ctx.fillRect(
            (Math.floor(-offsetX / scale / CELL_S) - 2) * CELL_S,
            (Math.floor(-offsetY / scale / CELL_S) - 2) * CELL_S,
            (Math.ceil(W / scale / CELL_S) + 4) * CELL_S,
            (Math.ceil(H / scale / CELL_S) + 4) * CELL_S
        )

        if (gameState) {
            drawStones()

            const isSideX = gameState.xNumber == playerNumber
            turnText = (gameState.xTurn == isSideX) ? "YOUR TURN" : "OPPONENT'S TURN"

            switch (gameState.status) {
                case -2:
                    switch (gameInfo.type) {
                        case "create":
                            statusText = `GAME CODE: ${gameCode} - WAITING FOR OPPONENT`
                            break
                        case "ranked":
                            statusText = "WAITING IN RANKED QUEUE..."
                            break
                        case "random":
                            statusText = "WAITING IN RANDOM QUEUE..."
                            break
                    }
                    break
                case -1:
                    const myChar = playerNumber == gameState.xNumber ? 'X' : 'O'
                    const opponentChar = playerNumber == gameState.xNumber ? 'O' : 'X'

                    statusText = `${myChar}: ${username} vs ${opponentChar}: ${opponentUsername}`
                    break
                default:
                    gameOver()
                    drawWinLine()
                    break
            }
        } else {
            switch (gameInfo.type) {
                case "create":
                    statusText = "GAME CODE: " + gameCode
                    break
                case "ranked":
                    statusText = "WAITING IN RANKED QUEUE..."
                    break
                case "random":
                    statusText = "WAITING IN RANDOM QUEUE..."
                    break
            }
        }

        drawGrid()

        ctx.restore()
    }

    function gameOver() {
        const win = (playerNumber == gameState.xNumber ? 0 : 1) == gameState.status
        
        if (gameState.status == 2) {
            statusText = "DRAW"
        } else {
            statusText = win ? "YOU WIN" : "YOU LOSE"
            turnText = ""

            if (gameState.playerDisconnected) statusText = `${statusText} (${opponentUsername} DISCONNECTED)`
        }

        gameInfoStore.set({
            type: "home",
            gameCode: "",
        })
    }

    function drawWinLine() {
        const { a, b } = gameState.winLine

        ctx.save();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4 / scale; // scale line width so it looks consistent
        ctx.beginPath();
        ctx.moveTo(
            (a.x + 0.5) * CELL_S,
            (a.y + 0.5) * CELL_S
        );
        ctx.lineTo(
            (b.x + 0.5) * CELL_S,
            (b.y + 0.5) * CELL_S
        );
        ctx.stroke();
        ctx.restore();
    }
</script>

<main class="flex flex-col md:flex-row h-[100dvh] overflow-hidden">
  <!-- Left: Game board -->
    <section class="flex-1 p-4 sm:p-6 flex flex-col items-center overflow-auto">
        <h1 class="text-3xl mb-2 text-center">{statusText}</h1>

        <div class="w-full max-w-md aspect-square">
            <canvas
            bind:this={canvas}
            on:mousedown={mouseDown}
            on:mousemove={mouseMove}
            on:mouseup={mouseUp}
            on:mouseleave={mouseLeave}
            on:wheel|preventDefault={mouseWheel}
            on:contextmenu|preventDefault
            on:touchstart|preventDefault={touchStart}
            on:touchmove|preventDefault={touchMove}
            on:touchend|preventDefault={touchEnd}
            class="w-full h-full"
            ></canvas>
        </div>

        <h1 class="text-3xl mt-4">{turnText}</h1>

        {#if errorText}
            <p class="text-error text-center text-sm">{errorText}</p>
        {/if}
    </section>

    <!-- Right: Chat or placeholder -->
    <section class="hidden md:block w-full md:w-1/2 border-t md:border-t-0 md:border-l border-base-300 p-4 sm:p-6 overflow-y-auto">
        <h2 class="text-3xl font-semibold mb-4">💬 Chat (Coming soon)</h2>
    </section>
</main>
