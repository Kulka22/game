let score = 0;
let isActive = false;
let record = 0;

const hand = document.getElementById('hand-cursor');
const ball = document.getElementById('ball');
const gameArea = document.getElementById('finger-game-screen');

let ballX = 400;
let ballY = 200;
let velX = 3;
let velY = -5;
const gravity = 0.3;

const handWidth = 60;  
const handHeight = 60;
const ballSize = 40;   
const handRadius = handWidth / 2;
const ballRadius = ballSize / 2;

let handX = 0;
let handY = 0;

function init() {
    setupEventListeners();
    startGame();
    loadRecord();
    updateUI();
}

function setupEventListeners() {
    const THRESHOLD_PERCENT = 0.9;
    
    document.addEventListener('mousemove', (e) => {
        const thresholdY = window.innerHeight * THRESHOLD_PERCENT;
        
        if (e.clientY >= thresholdY || !isActive) {
            hand.style.opacity = '0';
            document.body.style.cursor = 'default';
        } else {
            hand.style.opacity = '1';
            document.body.style.cursor = 'none';
            hand.style.left = (e.clientX - handRadius) + 'px';
            hand.style.top = (e.clientY - handRadius) + 'px';
            handX = e.clientX;
            handY = e.clientY;
        }
    });

    document.getElementById('restart-btn').addEventListener('click', restart);
    document.getElementById('end-restart-btn').addEventListener('click', restart);
    document.getElementById('back-btn').addEventListener('click', () => window.location.href = '../game.html');
    document.getElementById('level-select-btn').addEventListener('click', () => window.location.href = '../game.html');
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
        
        if (player && player.fingerBall) {
            record = player.fingerBall.highScore || 0;
        } else {
            record = 0;
        }
    } catch (e) {
        console.error('Ошибка загрузки рекорда:', e);
        record = 0;
    }
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

let lastCollisionTime = 0;
const COLLISION_COOLDOWN = 150;

function checkCollision() {
    const now = Date.now();
    
    if (now - lastCollisionTime < COLLISION_COOLDOWN) {
        return;
    }
    
    const handCenterX = handX;
    const handCenterY = handY;
    const ballCenterX = ballX + ballRadius;
    const ballCenterY = ballY + ballRadius;
    
    const dx = handCenterX - ballCenterX;
    const dy = handCenterY - ballCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < handRadius + ballRadius) {
        lastCollisionTime = now;
        
        const nx = dx / distance;
        const ny = dy / distance;
        
        const dotProduct = velX * nx + velY * ny;
        
        const bounceFactor = 0.9;
        
        velX = velX - (1 + bounceFactor) * dotProduct * nx;
        velY = velY - (1 + bounceFactor) * dotProduct * ny;
        
        velX += nx * 1.2;
        velY += ny * 1.2;
        
        const overlap = (handRadius + ballRadius) - distance;
        const pushForce = 1.5;
        ballX -= nx * overlap * pushForce;
        ballY -= ny * overlap * pushForce;
        
        if (velY > -5) {
            velY = -Math.abs(velY) - 4;
        }
        
        const maxSpeed = 15;
        const currentSpeed = Math.sqrt(velX * velX + velY * velY);
        if (currentSpeed > maxSpeed) {
            velX = (velX / currentSpeed) * maxSpeed;
            velY = (velY / currentSpeed) * maxSpeed;
        }
        
        score++;
        updateUI();
    }
}

function gameLoop() {
    if (isActive) {
        ballX += velX;
        ballY += velY;
        velY += gravity;
        
        if (ballX <= 0 || ballX >= window.innerWidth - ballSize) {
            velX = -velX * 0.9;
            ballX = Math.max(0, Math.min(ballX, window.innerWidth - ballSize));
        }
        
        if (ballY <= 0) {
            velY = Math.abs(velY) * 0.8;
            ballY = 0;
        }
        
        if (ballY >= window.innerHeight - ballSize) {
            endGame();
            return;
        }
        
        checkCollision();
        
        ball.style.left = ballX + 'px';
        ball.style.top = ballY + 'px';
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    isActive = true;
    score = 0;
    gameLoop();
    updateUI();
}

function endGame() {
    isActive = false;
    
    if (score > record) {
        record = score;
    }
    saveResult();
    document.body.style.cursor = 'default';
    showScreen('result');
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('record').textContent = record;
}

function restart() {
    ballX = window.innerWidth / 2 - ballRadius;
    ballY = window.innerHeight / 2 - 200;
    
    velX = (Math.random() - 0.5) * 8;
    velY = -Math.random() * 6 - 3;
    
    showScreen('finger-game');
    startGame();
}

function saveResult() {
    const playerName = localStorage.getItem('currentPlayer');
    if (!playerName) return;
    
    let players = JSON.parse(localStorage.getItem('players')) || {};
    
    if (!players[playerName].fingerBall) {
        players[playerName].fingerBall = { highScore: 0, games: 0 };
    }
    
    players[playerName].fingerBall.games = (players[playerName].fingerBall.games || 0) + 1;
    
    if (score > (players[playerName].fingerBall.highScore || 0)) {
        players[playerName].fingerBall.highScore = score;
        record = score;
    }
    
    localStorage.setItem('players', JSON.stringify(players));
}

init();