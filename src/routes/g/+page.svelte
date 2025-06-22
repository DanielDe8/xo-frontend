<script>
    import { io } from "socket.io-client"
	import { error } from "@sveltejs/kit"
	import { onMount } from "svelte"
	import { get } from "svelte/store"
	import { goto } from "$app/navigation"
    import { SERVER_URL } from "$lib/util"
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

    let canvas
    let ctx

    let resultText
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
    })

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


    function drawGame() {
        if (gameState.last.exists) {
            ctx.fillStyle = LAST_COLOR
            ctx.fillRect(gameState.last.x * CELL_S, gameState.last.y * CELL_S, CELL_S, CELL_S)
        }

        for (const xx of gameState.xes) { 
            // ctx.fillStyle = "blue"
            // ctx.fillRect((xx.x + 0.25) * CELL_S, (xx.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)

            ctx.drawImage(X_IMG, (xx.x + (1 - STONE_SCALE) / 2) * CELL_S, (xx.y + (1 - STONE_SCALE) / 2) * CELL_S, CELL_S * STONE_SCALE, CELL_S * STONE_SCALE)
        }

        for (const o of gameState.os) { 
            // ctx.fillStyle = "red"
            // ctx.fillRect((o.x + 0.25) * CELL_S, (o.y + 0.25) * CELL_S, CELL_S / 2, CELL_S / 2)

            ctx.drawImage(O_IMG, (o.x + (1 - STONE_SCALE) / 2) * CELL_S, (o.y + (1 - STONE_SCALE) / 2) * CELL_S, CELL_S * STONE_SCALE, CELL_S * STONE_SCALE)
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
            drawGame()

            switch (gameState.status) {
                case -2:
                    switch (gameInfo.type) {
                        case "create":
                            resultText = `GAME CODE: ${gameCode} - WAITING FOR OPPONENT`
                            break
                        case "ranked":
                            resultText = "WAITING IN RANKED QUEUE..."
                            break
                        case "random":
                            resultText = "WAITING IN RANDOM QUEUE..."
                            break
                    }
                    break
                case -1:
                    const myChar = playerNumber == gameState.xNumber ? 'X' : 'O';
                    const opponentChar = playerNumber == gameState.xNumber ? 'O' : 'X';

                    resultText = `${myChar}: ${username} vs ${opponentChar}: ${opponentUsername}`
                    break
                default:
                    gameOver()
                    break
            }

            const isSideX = gameState.xNumber == playerNumber

            turnText = (gameState.xTurn == isSideX) ? "YOUR TURN" : "OPPONENTS TURN"
        } else {
            switch (gameInfo.type) {
                case "create":
                    resultText = "GAME CODE: " + gameCode
                    break
                case "ranked":
                    resultText = "WAITING IN RANKED QUEUE..."
                    break
                case "random":
                    resultText = "WAITING IN RANDOM QUEUE..."
                    break
            }
        }

        drawGrid()

        ctx.restore()
    }

    function gameOver() {
        const win = (playerNumber == gameState.xNumber ? 0 : 1) == gameState.status
        
        if (gameState.status == 2) {
            resultText = "DRAW"
        } else {
            resultText = win ? "YOU WIN" : "YOU LOSE"
        }

        gameInfoStore.set({
            type: "home",
            gameCode: "",
        })
    }
</script>

<main class="m-5">
    <h1 class="text-4xl">{ resultText }</h1> { errorText }

    <canvas 
        bind:this={ canvas }
        on:mousedown={ mouseDown }
        on:mousemove={ mouseMove }
        on:mouseup={ mouseUp }
        on:mouseleave={ mouseLeave }
        on:wheel|preventDefault={ mouseWheel }
        on:contextmenu|preventDefault

        class="mt-3 mb-3"
        
        width="600" height="600"
    ></canvas>

    <h1 class="text-4xl">{ turnText }</h1>
</main>