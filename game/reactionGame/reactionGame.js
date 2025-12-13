const levelSettings = {
    'easy': {
        isInfinitely: false
    },
    'hard': {
        isInfinitely: false
    },
    'inf': {
        isInfinitely: true
    }
};

let keys = {}
let record = 0;

let gameState = {
    timeLeft: 5,
    isActive: false,
    record: localStorage.getItem('reactionGameRecord') || 0,
    isDragging: false,
    gameLoopId: null,
    gameTimerIDs: [],
    currentScores: 0
};

const currentScoresElement = document.getElementById('current-scores');
const recordElement = document.getElementById('record');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');
const lvlSelectBtn = document.getElementById('level-select-btn');

const player = document.getElementById('player');
const playerStyles = window.getComputedStyle(player);
let playerPosX = 0;
let playerPosY = 0;
let playerVel = 5;
const playerWidth = parseInt(playerStyles.width);
const playerHeight = parseInt(playerStyles.height);
const playerRadius = playerWidth / 2;

const game = document.getElementById('game');
const ground = document.getElementById('ground');
const gameStyles = window.getComputedStyle(game);
const groundStyles = window.getComputedStyle(ground);
const groundWidth = parseInt(gameStyles.width);
const groundHeight = parseInt(groundStyles.height);

let isBallFlying = false;
let currentBall = null;
let ballRadius = 20;
let ballVelX = 0;
let ballVelY = 0;
let ballPosX = 0;
let ballPosY = 0;
let ballDirection = -1;
let isHitted = false;

const gravity = 0.4;

function init() {
    player.style.bottom = groundHeight + "px";
    playerPosX = groundWidth / 5;
    setupEventListeners();
    loadRecord();
    updateUI();
}

function setupEventListeners() {
    restartBtn.addEventListener('click', restartGame);
    backBtn.addEventListener('click', () => window.location.href = '../game.html');
    startBtn.addEventListener('click', () => startGame());
    lvlSelectBtn.addEventListener('click', () => window.location.href = '../game.html');

    document.addEventListener("keydown", e => {
        const k = this.normKey(e.key);
        keys[k] = true;
    });

    document.addEventListener("keyup", e => {
        const k = this.normKey(e.key);
        keys[k] = false;
    });
}

function loadRecord() {
    const playerName = localStorage.getItem('currentPlayer');
    if (!playerName) {
        record = 0;
        return;
    }

    const playersData = localStorage.getItem('players');
    if (!playersData) {
        record = 0;
        return;
    }

    try {
        const players = JSON.parse(playersData);
        const player = players[playerName];

        if (player && player.reactionGame) {
            record = player.reactionGame.highScore || 0;
        } else {
            record = 0;
        }
    } catch (e) {
        console.error('Ошибка загрузки рекорда:', e);
        record = 0;
    }
}

function startGame() {
    gameState.isActive = true;
    showScreen('game');
    gameLoop();
}

function restartGame() {
    startGame();
}

function endGame() {
    gameState.isActive = false;
    saveResult();
    if (gameState.gameLoopId) {
        cancelAnimationFrame(gameState.gameLoopId);
        gameState.gameLoopId = null;
    }
    clearAllTimers();
    showScreen('result');
    gameState.currentScores = 0;
    currentScoresElement.textContent = 0;
}

function clearAllTimers() {
    console.log("Очищаем таймеры:", gameState.gameTimerIDs.length);
    gameState.gameTimerIDs.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
    });
    gameState.gameTimerIDs = [];
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

function normKey(k) {
    if (!k) return k;
    const lower = k.length === 1 ? k.toLowerCase() : k;

    const map = {
        'ф': 'a',
        'ы': 's',
        'в': 'd',
        'ц': 'w'
    };

    return map[lower] || lower;
}

function updatePlayer() {
    if (keys["a"]) {
        playerPosX = Math.max(0, playerPosX - playerVel);
    }
    if (keys["d"]) {
        playerPosX = Math.min(groundWidth / 2 - playerWidth, playerPosX + playerVel);
    }

    player.style.left = playerPosX + "px";
}

function gameLoop() {
    if (!gameState.isActive) return;
    updatePlayer();
    if (!isBallFlying) {
        createNewBall();
        isBallFlying = true;
    }
    if (ballVelX !== 0 && ballVelY !== 0) {
        ballPosX += ballVelX * ballDirection;
        ballPosY += ballVelY;
        ballVelY -= gravity;
        updateBall();
        if (checkPlayerHit()) {
            createScoreEffect(playerPosX + playerWidth / 2, playerPosY + playerHeight);

            const timerID = setTimeout(() => {
                completeRound();
            }, 1500);
            gameState.currentScores++;
            updateUI();
            gameState.gameTimerIDs.push(timerID);
        }
        else if (!isHitted && ballPosY <= groundHeight) {
            completeRound();
            endGame();
        }
    }
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}

function createScoreEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'score-effect';
    effect.textContent = '+1';

    effect.style.left = x + 'px';
    effect.style.bottom = y + 'px';

    game.appendChild(effect);

    setTimeout(() => {
        if (effect.parentNode) {
            effect.remove();
        }
    }, 1000);
}

function updateBall() {
    currentBall.style.left = ballPosX + "px";
    currentBall.style.bottom = ballPosY + "px";
}

function completeRound() {
    currentBall.remove();
    currentBall = null;
    isBallFlying = false;
    isHitted = false;
    ballVelX = 0;
    ballVelY = 0;
}

function createNewBall() {
    if (!gameState.isActive) return;
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.id = 'current-ball';
    ball.classList.add('ball-custom-style');

    const startX = 770;
    const startY = 220;
    ballPosX = startX;
    ballPosY = startY;

    ball.style.left = startX + 'px';
    ball.style.bottom = startY + 'px';

    game.appendChild(ball);
    currentBall = ball;

    const delay = 1000 + Math.random() * 3000;

    const timerID = setTimeout(() => {
        launchBall();
    }, delay);
    gameState.gameTimerIDs.push(timerID);
}

function launchBall() {
    if (!gameState.isActive) return;
    isBallFlying = true;
    let powerX = 12 + Math.random() * 50;
    let powerY = 20 + Math.random() * 42;
    if (powerX + powerY > 92 || powerX + powerY < 62) {
        let temp = 62 + Math.random() * 30;
        powerX = temp / 2;
        powerY = temp / 2;
    }
    ballVelX = 4 + powerX * 0.15;
    ballVelY = 3 + powerY * 0.20;

    power = 0;
    return;
}

let lastCollisionTime = 0;
const COLLISION_COOLDOWN = 150; 

function checkPlayerHit() {
    const now = Date.now();
    
    if (now - lastCollisionTime < COLLISION_COOLDOWN) {
        return;
    }

    if (!currentBall) return;

    const playerRect = getPlayerRect();
    const ballRect = currentBall.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    const ballLeft = ballRect.left - gameRect.left;
    const ballTop = ballRect.top - gameRect.top;

    const ballCenterX = ballLeft + ballRadius;
    const ballCenterY = ballTop + ballRadius;
    const playerCenterX = playerRect.left + playerRadius;
    const playerCenterY = playerRect.top + playerRadius;

    const dx = playerCenterX - ballCenterX;
    const dy = playerCenterY - ballCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < playerRadius + ballRadius) {
        ballVelY = 4 + 80 * 0.15;
        ballVelX = (3 + 30 * 0.20) * -1;
        currentBall.style.left = ballPosX + "px";
        currentBall.style.bottom = ballPosY + "px";
        isHitted = true;
        return true;
    }
}

function getPlayerRect() {
    const rect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    return {
        left: rect.left - gameRect.left,
        top: rect.top - gameRect.top,
        right: rect.right - gameRect.left,
        bottom: rect.bottom - gameRect.top,
        width: rect.width,
        height: rect.height
    };
}

function saveResult() {
    const playerName = localStorage.getItem('currentPlayer');
    if (!playerName) return;

    let players = JSON.parse(localStorage.getItem('players')) || {};

    if (!players[playerName]) {
        players[playerName] = {
            name: playerName,
            joined: new Date().toISOString(),
            fingerBall: { highScore: 0, games: 0 },
            reactionGame: { highScore: 0, games: 0 },
            hitTarget: { maxLevel: 0 }
        };
    }

    if (!players[playerName].reactionGame) {
        players[playerName].reactionGame = { highScore: 0, games: 0 };
    }

    players[playerName].reactionGame.games = (players[playerName].reactionGame.games || 0) + 1;

    if (gameState.currentScores > (players[playerName].reactionGame.highScore || 0)) {
        players[playerName].reactionGame.highScore = gameState.currentScores;
        record = gameState.currentScores;
        updateUI();
    }

    localStorage.setItem('players', JSON.stringify(players));
}

function updateUI() {
    currentScoresElement.textContent = gameState.currentScores;
    recordElement.textContent = record;
}

init();