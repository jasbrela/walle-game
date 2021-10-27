window.onload = function () {
    // preload sprites
    const assetsUrl = "assets/"
    preloadAllSprites();

    // event handler
    const button = document.getElementById('restart-button')
    button.addEventListener('click', () => {
        gameSetup()
        button.style.display = 'none'
    })

    const handler = new EventHandler();
    handler.on('game:lose', () => {
        // show restart button
        button.style.display = 'block'  
    });

    // canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // setting up sprites
    const player = new Image(), obstacle = new Image(), ground = new Image(), sky = new Image();
    
    obstacle.src = `${assetsUrl}obstacle_1.png`;
    player.src = `${assetsUrl}player1_1.png`;
    ground.src = `${assetsUrl}ground1_1.png`;
    sky.src = `${assetsUrl}sky1.png`;


    // sprite counters
    let playerSpriteCounter = 1;
    let skySpriteCounter = 1;
    let groundSpriteCounter = 1;
    let skySpriteChange = false;

    // jumping
    let limit = 80;
    let goingDown = false;
    let isJumping = false;
    let jumpSpeed = 1;

    // texts
    const textColor = "white"

    // player & obstacle start position
    const playerX = canvas.width / 11, obstacleY = canvas.height - 180;
    let playerY = canvas.height - 150, obstacleX = canvas.width + 10;
    const initialY = playerY;

    // obstacle
    let obstacleSpeed = 1;

    // counters
    let playerScoreTimer = setInterval(scoreTimer, 1000);
    let playerSpriteTimer = setInterval(spriteTimer, 300);
    let difficultyTimer = setInterval(updateDifficulty, 1000);
    let gameTime = 1;

    // game
    let score = 0;
    let timeout = 5;
    let game = setInterval(gameLoop, timeout);

    // detect clicks and call MovePlayer()
    window.onkeydown = movePlayerUsingKeyboard;
    window.ontouchstart = movePlayerUsingTouch;

    const gameSetup = () => {
        // sprite counters
        playerSpriteCounter = 1;
        skySpriteCounter = 1;
        groundSpriteCounter = 1;
        skySpriteChange = false;

        // jumping
        limit = 80;
        goingDown = false;
        isJumping = false;
        jumpSpeed = 1;

        // player & obstacle start position
        playerY = canvas.height - 150, obstacleX = canvas.width + 10;

        // obstacle
        obstacleSpeed = 1;

        // counters
        playerScoreTimer = setInterval(scoreTimer, 1000);
        playerSpriteTimer = setInterval(spriteTimer, 300);
        difficultyTimer = setInterval(updateDifficulty, 1000);
        gameTime = 0;

        // game
        score = 0;
        timeout = 5;
        game = setInterval(gameLoop, timeout);
    }

    // functions
    function gameLoop() {
        ctx.clearRect(0, 0, 800, 400);

        changeSprites();
        drawEverything(playerX, playerY);
        checkForBoundaries();
        detectCollisions(obstacleX, obstacleY);
        writeStartMessage();
        writeScoreText();
    }

    //#region Functions related to Movement
    function movePlayerUsingKeyboard(keycode) {
        if (!isJumping) {
            switch (keycode.keyCode) {
                case 32:
                case 38:
                    jumpInterval = setInterval(jump, 2);
                    break;
            }
        }
    }

    function movePlayerUsingTouch() {
        if (!isJumping) {
            jumpInterval = setInterval(jump, 2);
        }
    }

    function jump() {
        isJumping = true;
        if (playerY > limit && !goingDown) {
            playerY -= jumpSpeed;
        } else {
            goingDown = true;
            playerY += jumpSpeed;

            if (Math.floor(playerY) >= Math.floor(initialY)) {
                isJumping = false;
                goingDown = false;
                clearInterval(jumpInterval);
            }
        }
    }

    function detectCollisions(obstacleX, obstacleY) {
        const tolerance = 60;
        if (((playerX + player.width - tolerance) > obstacleX && playerX < (obstacleX + obstacle.width - tolerance)) &&
            ((playerY + player.width - tolerance) > obstacleY) && (playerY < (obstacleY + obstacle.height - tolerance))) {
            window.clearInterval(game);
            window.clearInterval(playerScoreTimer);
            window.clearInterval(playerSpriteTimer);
            window.clearInterval(difficultyTimer);


            writeGameOverMessage();
            handler.emit('game:lose');
        }
    }

    function checkForBoundaries() {
        if (obstacleX < -obstacle.width) {
            obstacleX = canvas.width + obstacle.width;
        }
    }
    //#endregion

    //#region Functions related to Sprite

    function changeSprites() {
        
        changePlayerSprite();
        changeGroundSprite();
        changeSkySprite();
    }

    function changePlayerSprite() {
        player.src = `${assetsUrl}player1_${playerSpriteCounter}.png`;
    }

    function changeGroundSprite() {
        ground.src = `${assetsUrl}ground1_${groundSpriteCounter}.png`;
    }

    function changeSkySprite() {
        skySpriteChange ? sky.src = `${assetsUrl}sky1.png` : sky.src = `${assetsUrl}sky2.png`
    }

    function spriteTimer() {
        playerSpriteCounter++
        groundSpriteCounter++;

        if (playerSpriteCounter > 4) {
            playerSpriteCounter = 1;
        }

        if (groundSpriteCounter > 8) {
            groundSpriteCounter = 1;
        }
    }

    function drawEverything(x, y) {
        drawSky();
        drawGround();
        drawPlayer(x ,y);
        drawObstacle();
    }

    function drawPlayer(x, y) {
        ctx.drawImage(player, x, y);
    }

    function drawGround() {
        ctx.drawImage(ground, 0, 0);
    }

    function drawSky() {
        ctx.drawImage(sky, 0, 0);
    }

    function drawObstacle() {
        ctx.drawImage(obstacle, obstacleX, obstacleY);
        obstacleX -= obstacleSpeed;
    }

    //#endregion

    function updateDifficulty() {
        gameTime++;

        if (gameTime % 30 == 0) {
            skySpriteChange ? skySpriteChange = false : skySpriteChange = true;
        }

        const multiplier = 0.015;
        obstacleSpeed += multiplier;
        jumpSpeed += multiplier;
    }

    //#region Functions related to Text
    function scoreTimer() {
        score = score + 10 // to update score every second, as a timer
    }

    function writeScoreText() {
        ctx.font = "30px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.fillText("Pontuação: " + score, canvas.width / 40, canvas.height / 10);
    }

    function writeGameOverMessage() {
        ctx.font = "72px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Fim de Jogo!", canvas.width / 2, canvas.height / 2);
    }

    function writeStartMessage() {
        ctx.font = "16px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Toque na tela para pular", 650, canvas.height / 11.5);
    }
    //#endregion

    //#region Functions related to Tools
    function randomizer(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    function preloadAllSprites() {
        // player
        preloadSprites(`${assetsUrl}player1_1.png`);
        preloadSprites(`${assetsUrl}player1_2.png`);
        preloadSprites(`${assetsUrl}player1_3.png`);
        preloadSprites(`${assetsUrl}player1_4.png`);

        // obstacles
        preloadSprites(`${assetsUrl}obstacle_1.png`);

        // ground
        preloadSprites(`${assetsUrl}ground1_1.png`);
        preloadSprites(`${assetsUrl}ground1_2.png`);
        preloadSprites(`${assetsUrl}ground1_3.png`);
        preloadSprites(`${assetsUrl}ground1_4.png`);
        preloadSprites(`${assetsUrl}ground1_5.png`);
        preloadSprites(`${assetsUrl}ground1_6.png`);
        preloadSprites(`${assetsUrl}ground1_7.png`);
        preloadSprites(`${assetsUrl}ground1_8.png`);

        // sky
        preloadSprites(`${assetsUrl}sky1.png`);
        preloadSprites(`${assetsUrl}sky2.png`);
    }

    function preloadSprites(url) {
        let img = new Image();
        img.src = url;
    }
    //#endregion
}


class EventHandler {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
        }
    }
}