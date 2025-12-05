/*TO-DO:
ОБЯЗАТЕЛЬНО:
1. Новый уровень открывается только после успешного прохождения предыдущего (но добавить "секретную" кнопку для открытия всех)
2. Авторизацию доделать
3. Сохранение данных и прогресса для каждого пользователя (вход пока что будет только по имени)
4. Графика (svg мячик например и т.д., мб сам нарисуй)
5. Подумай над доп фишками
6. Интегрируй модуль игры в сайт!!
7. Обнови на гитхабе, чтобы игра хостилась

Опционально:
1. Игра вдвоем на одной клаве (но это сложно довольно)
*/

// Настройки уровней
const levelSettings = {
    1: {
        netMoving: false,
        ballMoving: false,
        powerMultiplier: 1.0
    },
    2: {
        netMoving: true,
        ballMoving: false,
        powerMultiplier: 1.0
        //p.s. можно еще уменьшение зоны добавить на более сложных уровнях
    },
    3: {
        netMoving: true,
        ballMoving: true,
        powerMultiplier: 1.0,
        ballMoveSpeed: 1.2
        //p.s. можно еще уменьшение зоны добавить на более сложных уровнях
    }
};

// У каждого уровня свои индивидуальные настройки сложности
const difficultySettings = {
    1: {
        'easy': {
            targetScore: 5,
            targetWidth: 120,
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
            time: 70
        },
        'hard': {
            targetScore: 10,
            targetWidth: 85,
            time: 50
        }
    },
    3: {
        'easy': {
            targetScore: 7,
            targetWidth: 140,
            time: 75,
            netInterval: 50
        },
        'hard': {
            targetScore: 9,
            targetWidth: 100,
            time: 55,
            netInterval: 10
        }
    }
};

// Уровни, очки, таймер и прочий визуал
let currentLevel = 1;
let currentDifficulty = 'easy';
let score = 0;
let currentTargetScore = 5;
let timeLeft = 60;
let gameTimer = null;
let isGameActive = false;
let netAnimationInterval = null;

// Элементы DOM
const ball = document.getElementById("ball");
const game = document.getElementById("game");
const net = document.querySelector(".net");
const targetZone = document.getElementById("target-zone");

// Разное непосредственно игровое
let charging = false;
let power = 0;
let powerTimer = null;
const groundLevel = 75; // ВАЖНО, ЧТОБЫ КАК У TargetZone в CSS было
let ballX = 120;
const ballStartHeight = 120;
const ballStartXPosition = 120;
let ballY = groundLevel + 120;
let velX = 0;
let velY = 0;
const gravity = 0.40;
let hasTouchedGround = false;
let impactX = null; // позиция мяча для расчета попадания в зону беленькую


// Движение мяча
let ballDirection = 1; // 1 - вправо, -1 - влево
let isBallMoving = false;
let ballMoveX = 0; // Отдельная переменная для движения мяча ДО удара

// Сетка
const netX = 450;
const netW = 8;
const netBottom = groundLevel + 5;
let netHeight = 200;
let netTop = netBottom + netHeight;
let currentNetInterval;

// Зона попадания
let targetStartX = 815;
let targetWidth = 85;
let targetEndX = targetStartX + targetWidth;
const targetZoneMinXPos = 600; // изначально было 500, но лучше чуть больше, чтобы не прям под сеткой
const targetZoneMaxXPos = 830;

function init() {
    setupEventListeners();
    resetBall();
    gameLoop();
}

function setupEventListeners() {
    document.getElementById('back-to-levels').addEventListener('click', showLevelSelect);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('level-select-btn').addEventListener('click', showLevelSelect);
}

function showScreen(screenName) {
    // Сначала скрыть экраны надо
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // А потом уже нужный показать!!
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Управляем видимостью header и footer
    // Во время режима "game" хедер и футер не должны быть видны
    // Не удаляй тут ничего оно все надо!!!!!
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

// Вынесено в отдельную функцию, чтобы когда мы обработчики вешаем на кнопки
// более локанично смотрелось и не надо было лямбды прописывать внутри них
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
    if (level === 3)
        currentNetInterval = difficulty.netInterval;

    // Останавливаем предыдущие анимации, если есть
    if (netAnimationInterval) {
        clearInterval(netAnimationInterval);
        netAnimationInterval = null;
    }

    // Применение настроек для уровня, который выбрал игрок (1,2,3 и тд)
    setupLevel(settings);

    // Сброс параметров игры
    score = 0;
    timeLeft = difficulty.time;
    targetWidth = difficulty.targetWidth;
    isGameActive = true;
    isBallMoving = settings.ballMoving;

    // Обновление UI
    document.getElementById('current-level-display').textContent = level;
    document.getElementById('target-score').textContent = currentTargetScore;
    document.getElementById('current-difficulty-display').textContent = difficultyMode;
    updateUI();
    startTimer();
    showScreen('game');
    resetBall();
}

function setRandomTargetPosition() {
    // Вычисляем случайную позицию в правой половине поля
    const randomX = targetZoneMinXPos + Math.random() * (targetZoneMaxXPos - targetZoneMinXPos - targetWidth);

    // Округляем до целого числа
    const targetX = Math.floor(randomX);

    // Обновляем визуальную зону
    targetZone.style.width = targetWidth + 'px';
    targetZone.style.left = targetX + 'px';

    // Обновляем логические переменные для проверки попадания
    targetStartX = targetX;
    targetEndX = targetStartX + targetWidth;
}

function setupLevel(settings) {
    // Настройка зоны попадания
    /*targetZone.style.width = settings.targetWidth + 'px';
    targetZone.style.left = settings.targetStartX + 'px';
    targetStartX = settings.targetStartX;
    targetWidth = settings.targetWidth;
    targetEndX = targetStartX + targetWidth;*/

    // Настройка сетки
    net.style.height = '200px';
    if (settings.netMoving) {
        startNetAnimation();
    }
}

function startNetAnimation() {
    let height = 150;
    let direction = 1;

    netAnimationInterval = setInterval(() => {
        if (!isGameActive) {
            clearInterval(netAnimationInterval);
            return;
        }

        height += direction * 1.5;
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

    // Двигаем мяч только когда он НЕ ЛЕТИТ (на земле)
    if (velX === 0 && velY === 0 && ballY === groundLevel + 120) {
        ballMoveX += settings.ballMoveSpeed * ballDirection;

        // Меняем направление при достижении границ
        if (ballMoveX <= 50) {
            ballDirection = 1; // Двигаемся вправо
            ballMoveX = 50;
        } else if (ballMoveX >= 300) {
            ballDirection = -1; // Двигаемся влево
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

    //Убираем режим game
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
        resultTitle.textContent = 'Победа!';
        resultMessage.textContent = `Вы набрали ${score} очков и прошли уровень ${currentLevel}!`;
    } else {
        resultTitle.textContent = 'Время вышло!';
        resultMessage.textContent = `Вы набрали ${score} из ${currentTargetScore} очков.`;
    }

    showScreen('result');
}

function restartGame() {
    startGame(currentLevel, currentDifficulty);
}

/* 
Описание функции возвращения мяча в исходное положение:
hasTouchedGround = false; значение флага - мяч еще не касался земли
impactX = null; - сброс точки падения
if (levelSettings[currentLevel].ballMoving) {
        ballMoveX = 50 + Math.random() * 250; - случайная позиция начальная
        ballDirection = Math.random() > 0.5 ? 1 : -1; - Случайное начальное направление
        ballX = ballMoveX;
} - если мы на уровне 3, где мяч движется, то задаем ему рандомную позицию и направление движения
else {
        ballMoveX = 120;
        ballX = 120; - две эти переменные хоть и нужны только для 3го уровня, где мяч движется,
        но на уровнях 1 и 2 они тоже используются, чтобы не было лишних if и была единая архитектура
} - Для уровней 1 и 2 - фиксированная позиция
velX = 0;
velY = 0; - обнуляем скорости
ball.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)"; - это не дублирование кода (мы в обработке события MouseUp уже подобное писали),
а нужная строка, ведь без нее будет такой баг: если зажать мяч и не отпускать до конца уровня, то на следующем он останется с эффектом "зарядки"
*/
function resetBall() {
    hasTouchedGround = false;
    impactX = null;

    // Сбрасываем позицию мяча в зависимости от уровня
    if (levelSettings[currentLevel].ballMoving) {
        // Для уровня 3 - случайная начальная позиция в пределах движения
        ballMoveX = 50 + Math.random() * 250;
        // Случайное начальное направление
        ballDirection = Math.random() > 0.5 ? 1 : -1;
        ballX = ballMoveX;
    } else {
        // Для уровней 1 и 2 - фиксированная позиция
        ballMoveX = ballStartXPosition;
        ballX = ballStartXPosition;
    }

    ballY = groundLevel + ballStartHeight;
    velX = 0;
    velY = 0;

    //Это не удалять, оно надо!!
    ball.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";

    setRandomTargetPosition();
    updateBall();
}

/*
ниже - функция перевода вычисленных координат мяча в реальное положение на экране:
*/
function updateBall() {
    // Если мяч летит - используем ballX, если на земле - ballMoveX
    if (velX === 0 && velY === 0 && ballY === groundLevel + ballStartHeight) {
        ballX = ballMoveX;
    }

    ball.style.left = ballX + "px";
    ball.style.bottom = ballY + "px";
}

// Описание функции зарядки мяча:
/* в кратце: чем дольше зажимаем ЛКМ - тем сильнее удар будет, но есть ограничение
if (!isGameActive || velX !== 0) return; - проверка активна ли играть и не летит ли мяч
powerTimer = setInterval(() => { 
        power = Math.min(power + 1, 70); - каждый тик интервала сила увеличивается на 1 у.е., но не более 70!!
        ball.style.boxShadow = `0 0 ${power / 3 + 5}px rgba(255,0,0,0.8)`; - визуальный эффект "зарядки мячика"
    }, 10); - тик происходит каждые 10 мс
*/
game.addEventListener("mousedown", () => {
    if (!isGameActive || velX !== 0) return;

    charging = true;
    power = 0;

    powerTimer = setInterval(() => {
        power = Math.min(power + 1, 70);
        ball.style.boxShadow = `0 0 ${power / 3 + 5}px rgba(255,0,0,0.8)`;
    }, 10);
});

/* 
Описание функции ниже:
if (!charging || !isGameActive) return; - проверка активна ли игра и заряжался ли мяч
charging = false; - сбрасываем флаг зарядки мяча
if (powerTimer) {
        clearInterval(powerTimer);
        powerTimer = null;
} - сброс таймера зарядки, чтобы потом при следующей заново шло все
ball.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)"; - убираем с мяча эффект "зарядки"
velX = 4 + power * 0.15; - рассчитываем силу удара (скорость мяча) по X
velY = 3 + power * 0.20; - рассчитываем силу удара (скорость мяча) по Y
- параметры добыты эмпирическим путем
power = 0; - сбрасываем для дальнейшего использования силу заряженную
*/
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

// Проверка успеха
function checkWin() {
    //const ballCenterX = impactX + 20; //убрать "магическое число" радиуса мяча и сделать это константой или переменной!!
    const ballCenterX = impactX;

    const inZone = ballCenterX >= targetStartX && ballCenterX <= targetEndX;

    //ДЛЯ ОТЛАДКИ, УДАЛИ ПОТОМ:
    console.log(`Проверка: мяч=${ballCenterX}, зона=${targetStartX}-${targetEndX}, попадание=${inZone}`);

    if (inZone) {
        score++;
        updateUI();

        if (score >= currentTargetScore) {
            endGame(true);
        }
    }

    resetBall();
}

// Игровой цикл
function gameLoop() {
    if (isGameActive) {
        // ОБНОВЛЯЕМ ДВИЖЕНИЕ МЯЧА ДО УДАРА ТОЛЬКО НА 3 УРОВНЕ!!
        if (levelSettings[currentLevel].ballMoving) {
            updateBallMovement();
        }

        if (velX !== 0 || velY !== 0) {
            // Физика полета, что то типа параболки
            ballX += velX;
            ballY += velY;

            velY -= gravity;

            // Тут обработка касания с землей
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

                // Если мяч почти остановился после отскока, сбрасываем его
                if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1) {
                    resetBall();
                }
            }

            // КОЛЛИЗИЯ С СЕТКОЙ, ИСПРАВЬ ПОТОМ, ТУТ ПРОБЛЕМКИ ЕСТЬ!!
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

// Запуск игры
init();