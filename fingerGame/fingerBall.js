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
const ballSize = 40;   // Диаметр мяча
const handRadius = handWidth / 2;
const ballRadius = ballSize / 2;


let handX = 0;
let handY = 0;

function init() {
    setupEventListeners();
    startGame();
}

function setupEventListeners() {
    
    const THRESHOLD_PERCENT = 0.9;
    
    document.addEventListener('mousemove', (e) => {
        
        const thresholdY = window.innerHeight * THRESHOLD_PERCENT;
        
        if (e.clientY >= thresholdY) {
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
    document.getElementById('back-btn').addEventListener('click', () => window.location.href = '../index.html');
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
        
        const bounceFactor = 0.9; // Было 1, стало 0.9
        
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
        // Движение мяча
        ballX += velX;
        ballY += velY;
        velY += gravity;
        
        // Проверка столкновений с границами окна
        if (ballX <= 0 || ballX >= window.innerWidth - ballSize) {
            velX = -velX * 0.9; // Немного энергии теряется при ударе о стенку
            ballX = Math.max(0, Math.min(ballX, window.innerWidth - ballSize));
        }
        
        if (ballY <= 0) {
            velY = Math.abs(velY) * 0.8; // Отскок от потолка
            ballY = 0;
        }
        
        // Проверка падения (проигрыш) - если мяч упал ниже экрана
        if (ballY >= window.innerHeight - ballSize) {
            gameOver();
            return;
        }
        
        // Проверка столкновения с рукой
        checkCollision();
        
        // Обновление позиции мяча
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

function gameOver() {
    isActive = false;
    
    if (score > record) {
        record = score;
        localStorage.setItem('fingerGameRecord', record);
        updateUI();
    }
    
    alert(`Игра окончена! Очки: ${score} Рекорд: ${record}`);
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('record').textContent = record;
}

function restart() {
    // Сбрасываем позицию мяча в центр экрана
    ballX = window.innerWidth / 2 - ballRadius;
    ballY = window.innerHeight / 2 - ballRadius;
    
    // Случайное начальное направление
    velX = (Math.random() - 0.5) * 8;
    velY = -Math.random() * 6 - 3; // Всегда немного вверх
    
    startGame();
}

init();