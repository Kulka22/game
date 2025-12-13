function loadFingerBallColors() {
    const currentPlayer = localStorage.getItem('currentPlayer');
    const players = JSON.parse(localStorage.getItem('players'));
    const colorSettings = players[currentPlayer].colorSettings['finger-ball'];

    applyColorsToFingerBall(colorSettings);
}

function applyColorsToFingerBall(colors) {
    const ball = document.getElementById('ball');
    if (ball) {
        ball.style.background = colors.ballColor;
        console.log(colors.ballColor);
        ball.style.boxShadow = `0 0 10px ${colors.ballColor}80`;
    }

    const hand = document.getElementById('hand-cursor');
    if (hand) {
        hand.style.background = colors.handColor;
    }

    const gameScreen = document.getElementById('finger-game-screen');
    if (gameScreen) {
        gameScreen.style.background = colors.bgColor;
    }

    document.querySelectorAll('#score, #record').forEach(el => {
        el.style.color = colors.textColor;
    });

    if (!document.getElementById('custom-colors-style')) {
        const style = document.createElement('style');
        style.id = 'custom-colors-style';
        document.head.appendChild(style);
    }

    const style = document.getElementById('custom-colors-style');
    style.textContent = `
        .hit-effect {
            background: radial-gradient(circle, ${colors.effectColor}80 0%, transparent 70%) !important;
        }
    `;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFingerBallColors);
} else {
    loadFingerBallColors();
}