const levelSettings = {
    1: {
        netMoving: false,
        ballMoving: false
    },
    2: {
        netMoving: true,
        ballMoving: false
    },
    3: {
        netMoving: true,
        ballMoving: true
    }
};

const difficultySettings = {
    1: {
        'easy': {
            targetScore: 5,
            targetWidth: 150,
            time: 70
        },
        'hard': {
            targetScore: 10,
            targetWidth: 70,
            time: 40
        }
    },
    2: {
        'easy': {
            targetScore: 6,
            targetWidth: 130,
            time: 70,
            netInterval: 15
        },
        'hard': {
            targetScore: 10,
            targetWidth: 85,
            time: 50,
            netInterval: 5
        }
    },
    3: {
        'easy': {
            targetScore: 7,
            targetWidth: 140,
            time: 75,
            netInterval: 15
        },
        'hard': {
            targetScore: 9,
            targetWidth: 100,
            time: 55,
            netInterval: 5
        }
    }
};

const currentPlayer = localStorage.getItem('currentPlayer');
let currentLevel = 1;
let maxLevel = null;
let currentDifficulty = 'easy';
let score = 0;
let currentTargetScore = 5;
let timeLeft = 60;
let gameTimer = null;
let isGameActive = false;
let netAnimationInterval = null;

const ball = document.getElementById("ball");
const game = document.getElementById("game");
const net = document.querySelector(".net");
const targetZone = document.getElementById("target-zone");

let charging = false;
let power = 0;
let powerTimer = null;
const groundLevel = 75;
let ballX = 120;
const ballStartHeight = 120;
const ballStartXPosition = 120;
let ballY = groundLevel + 120;
let velX = 0;
let velY = 0;
const gravity = 0.40;
let hasTouchedGround = false;
let impactX = null;

let ballDirection = 1;
let isBallMoving = false;
let ballMoveX = 0;

const netX = 450;
const netW = 8;
const netBottom = groundLevel + 5;
let netHeight = 200;
let netTop = netBottom + netHeight;
let currentNetInterval;

let targetStartX = 815;
let targetWidth = 85;
let targetEndX = targetStartX + targetWidth;
const targetZoneMinXPos = 600;
const targetZoneMaxXPos = 830;

function loadGameColors() {
    const players = localStorage.getItem('players');
    if (players) {
        try {
            const allSettings = JSON.parse(players);
            const colors = allSettings[currentPlayer].colorSettings['hit-target'];
            if (colors) {
                applyGameColors(colors);
            }
        } catch (e) {
            console.log('Не удалось загрузить цвета игры!!!!!');
        }
    }
}

function applyGameColors(colors) {
    const ball = document.getElementById('ball');
    if (ball && colors.ballColor) {
        ball.style.background = `radial-gradient(circle, #fff6c4, ${colors.ballColor})`;
    }

    const bg = document.getElementById('game-screen');
    if (bg && colors.ballColor) {
        bg.style.background = colors.bgColor;
    }

    const sky = document.getElementById('game');
    if (sky && colors.skyColor) {
        sky.style.background = colors.fieldColor;
    }

    const ground = document.querySelector('.ground');
    if (ground && colors.groundColor) {
        ground.style.background = colors.groundColor;
    }

    const net = document.querySelector('.net');
    if (net && colors.netColor) {
        net.style.background = colors.netColor;
    }

    const targetZone = document.getElementById('target-zone');
    if (targetZone && colors.zoneColor) {
        targetZone.style.background = colors.zoneColor;
        if (colors.ballColor) {
            targetZone.style.border = `1px dashed ${colors.ballColor}`;
        }
    }
}

function init() {
    loadGameColors();
    showLevelCards();
    setupEventListeners();
    resetBall();
    gameLoop();
}

function setupEventListeners() {
    document.getElementById('back-to-levels').addEventListener('click', showLevelSelect);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('level-select-btn').addEventListener('click', showLevelSelect);
}

function showLevelCards() {
    const levelCards = document.querySelectorAll('.level-card');

    if (maxLevel == null) {
        const players = localStorage.getItem('players');
        const allSettings = JSON.parse(players);
        maxLevel = allSettings[currentPlayer].hitTarget.maxLevel;
    }

    let i = 1;
    levelCards.forEach(levelCard => {
        if (i++ <= maxLevel + 1) {
            levelCard.classList.remove('disabled');
            levelCard.querySelectorAll('button').forEach(btn => {
                btn.disabled = false;
            });
        }
    });
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    if (screenName == 'level-select')
        showLevelCards();

    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    if (header && main && footer) {
        if (screenName === 'game') {
            targetScreen.classList.add('game');
            header.classList.add('game');
            main.classList.add('game');
            footer.classList.add('game');
        }
        else {
            targetScreen.classList.remove('game');
            header.classList.remove('game');
            main.classList.remove('game');
            footer.classList.remove('game');
        }
    }
}

function showLevelSelect() {
    stopGame();
    showScreen('level-select');
}

function startGame(level, difficultyMode) {
    currentLevel = level;
    currentDifficulty = difficultyMode;
    const settings = levelSettings[level];
    const difficulty = difficultySettings[level][difficultyMode];
    currentTargetScore = difficulty.targetScore;
    if (level === 3 || level === 2)
        currentNetInterval = difficulty.netInterval;

    if (netAnimationInterval) {
        clearInterval(netAnimationInterval);
        netAnimationInterval = null;
    }

    setupLevel(settings);

    score = 0;
    timeLeft = difficulty.time;
    targetWidth = difficulty.targetWidth;
    isGameActive = true;
    isBallMoving = settings.ballMoving;

    document.getElementById('current-level-display').textContent = level;
    document.getElementById('target-score').textContent = currentTargetScore;
    document.getElementById('current-difficulty-display').textContent = difficultyMode;
    updateUI();
    startTimer();
    showScreen('game');
    resetBall();
}

function setRandomTargetPosition() {
    const randomX = targetZoneMinXPos + Math.random() * (targetZoneMaxXPos - targetZoneMinXPos - targetWidth);

    const targetX = Math.floor(randomX);

    targetZone.style.width = targetWidth + 'px';
    targetZone.style.left = targetX + 'px';

    targetStartX = targetX;
    targetEndX = targetStartX + targetWidth;
}

function setupLevel(settings) {
    net.style.height = '200px';
    if (settings.netMoving) {
        startNetAnimation();
    }
}

function startNetAnimation() {
    console.log(`CNI: ${currentNetInterval}`);
    let height = 150;
    let direction = 1;

    netAnimationInterval = setInterval(() => {
        if (!isGameActive) {
            clearInterval(netAnimationInterval);
            return;
        }

        height += direction * 0.5;
        if (height > 250 || height < 150) {
            direction *= -1;
        }
        net.style.height = height + 'px';
        netHeight = height;
        netTop = netBottom + netHeight;
    }, currentNetInterval);
}

function updateBallMovement() {
    if (!isGameActive || !isBallMoving) return;

    const settings = levelSettings[currentLevel];

    if (velX === 0 && velY === 0 && ballY === groundLevel + 120) {
        ballMoveX += settings.ballMoveSpeed * ballDirection;

        if (ballMoveX <= 50) {
            ballDirection = 1;
            ballMoveX = 50;
        } else if (ballMoveX >= 300) {
            ballDirection = -1;
            ballMoveX = 300;
        }
    }
}

function startTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
    }

    gameTimer = setInterval(() => {
        if (!isGameActive) return;

        timeLeft--;
        updateUI();

        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function stopGame() {
    isGameActive = false;
    isBallMoving = false;

    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    if (powerTimer) {
        clearInterval(powerTimer);
        powerTimer = null;
    }
    if (netAnimationInterval) {
        clearInterval(netAnimationInterval);
        netAnimationInterval = null;
    }
}

function updateUI() {
    document.getElementById('time-left').textContent = timeLeft;
    document.getElementById('score').textContent = score;
}

function endGame(isWin) {
    stopGame();

    const main = document.querySelector('main');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (main && header && footer) {
        main.classList.remove('game');
        header.classList.remove('game');
        footer.classList.remove('game');
    }

    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');

    if (isWin) {
        saveHitTargetResult(currentLevel);
        resultTitle.textContent = 'Победа!';
        resultMessage.textContent = `Вы набрали ${score} очков и прошли уровень ${currentLevel}!`;
    } else {
        resultTitle.textContent = 'Время вышло!';
        resultMessage.textContent = `Вы набрали ${score} из ${currentTargetScore} очков.`;
    }

    showScreen('result');
}

function saveHitTargetResult(level) {
    if (!currentPlayer) return;

    let players = JSON.parse(localStorage.getItem('players')) || {};
    if (!players[currentPlayer]) return;

    if (level > (players[currentPlayer].hitTarget.maxLevel || 0)) {
        maxLevel++;
        players[currentPlayer].hitTarget.maxLevel = level;
        localStorage.setItem('players', JSON.stringify(players));
    }
}

function restartGame() {
    startGame(currentLevel, currentDifficulty);
}

function resetBall() {
    hasTouchedGround = false;
    impactX = null;

    if (levelSettings[currentLevel].ballMoving) {
        ballMoveX = 50 + Math.random() * 250;
        ballDirection = Math.random() > 0.5 ? 1 : -1;
        ballX = ballMoveX;
    } else {
        ballMoveX = ballStartXPosition;
        ballX = ballStartXPosition;
    }

    ballY = groundLevel + ballStartHeight;
    velX = 0;
    velY = 0;

    ball.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";

    setRandomTargetPosition();
    updateBall();
}

function updateBall() {
    if (velX === 0 && velY === 0 && ballY === groundLevel + ballStartHeight) {
        ballX = ballMoveX;
    }

    ball.style.left = ballX + "px";
    ball.style.bottom = ballY + "px";
}

game.addEventListener("mousedown", () => {
    if (!isGameActive || velX !== 0) return;

    charging = true;
    power = 0;

    powerTimer = setInterval(() => {
        power = Math.min(power + 0.5, 70);
        ball.style.boxShadow = `0 0 ${power / 2 + 5}px rgba(255,0,0,0.8)`;
    }, 10);
});

game.addEventListener("mouseup", () => {
    if (!charging || !isGameActive) return;
    charging = false;

    if (powerTimer) {
        clearInterval(powerTimer);
        powerTimer = null;
    }

    ball.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";

    velX = 4 + power * 0.15;
    velY = 3 + power * 0.20;

    power = 0;
});

function checkWin() {
    const ballCenterX = impactX;

    const inZone = ballCenterX >= targetStartX && ballCenterX <= targetEndX;

    if (inZone) {
        score++;
        updateUI();

        if (score >= currentTargetScore) {
            endGame(true);
        }
    }

    resetBall();
}

function gameLoop() {
    if (isGameActive) {
        if (levelSettings[currentLevel].ballMoving) {
            updateBallMovement();
        }

        if (velX !== 0 || velY !== 0) {
            ballX += velX;
            ballY += velY;

            velY -= gravity;

            if (ballY <= groundLevel) {
                ballY = groundLevel;

                if (!hasTouchedGround) {
                    hasTouchedGround = true;
                    impactX = ballX;

                    setTimeout(() => {
                        if (isGameActive) {
                            checkWin();
                        }
                    }, 500);
                }

                velY *= -0.35;
                velX *= 0.7;

                if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1) {
                    resetBall();
                }
            }

            const ballLeft = ballX;
            const ballRight = ballX + 40;
            const ballBottom = ballY;
            const ballTop = ballY + 40;

            const overlapX = ballRight > netX && ballLeft < netX + netW;
            const overlapY = ballBottom < netTop && ballTop > netBottom;

            if (overlapX && overlapY) {
                velX = -velX * 0.6;
                velY = Math.max(velY, 2);

                if (ballX + 20 < netX + netW / 2) {
                    ballX = netX - 41;
                } else {
                    ballX = netX + netW + 1;
                }
            }
        }

        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

function unlockAllLevels() {
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(levelCard => {
        levelCard.classList.remove('disabled');
        levelCard.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
        });
    });
}

init();