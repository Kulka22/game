function loadReactionGameColors() {
    const currentPlayer = localStorage.getItem('currentPlayer');
    const players = JSON.parse(localStorage.getItem('players'));
    const colorSettings = players[currentPlayer].colorSettings['reaction-game'];

    applyColorsToReactionGame(colorSettings);
}

function applyColorsToReactionGame(colors) {
    const gameContainer = document.querySelector('#game-screen');
    if (gameContainer) {
        gameContainer.style.background = colors.bgColor;
    }

    const sky = document.querySelector('#game');
    if (sky) {
        sky.style.background = colors.skyColor;
    }

    document.querySelectorAll('.game-info, .score, .timer, .stats, h1, h2, h3, p, span').forEach(el => {
        if (!el.closest('button') && !el.querySelector('button')) {
            el.style.color = colors.textColor;
        }
    });

    const ballStyle = document.createElement('style');
    ballStyle.textContent = `
    .ball-custom-style {
        background: ${colors.ballColor};
    }
    `;
    document.head.appendChild(ballStyle);


    const ball = document.getElementById('ball') || document.querySelector('.ball');
    if (ball) {
        ball.style.background = colors.ballColor;
        ball.style.boxShadow = `0 0 10px ${colors.ballColor}80`;

        if (ball.style.background.includes('gradient')) {
            ball.style.background = `radial-gradient(circle, #fff6c4, ${colors.ballColor})`;
        }
    }

    const player = document.getElementById('player') || document.querySelector('.player');
    if (player) {
        player.style.background = colors.playerColor;
        player.style.boxShadow = `0 0 10px ${colors.playerColor}80`;
    }

    const ground = document.getElementById('ground') || document.querySelector('.ground');
    if (ground) {
        ground.style.background = colors.groundColor;
    }

    const net = document.getElementById('net') || document.querySelector('.net');
    if (net) {
        net.style.background = colors.netColor;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadReactionGameColors();
    });
} else {
    loadReactionGameColors();
}


window.updateReactionGameColors = loadReactionGameColors;
