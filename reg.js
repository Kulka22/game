document.getElementById('regBtn').addEventListener('click', function () {
    const name = document.getElementById('regInput').value.trim();
    if (!name) {
        alert('Введите имя!');
        return;
    }

    localStorage.setItem('currentPlayer', name);

    let players = JSON.parse(localStorage.getItem('players')) || {};
    if (!players[name]) {
        players[name] = {
            name: name,
            joined: new Date().toISOString(),
            fingerBall: { highScore: 0, games: 0 },
            reactionGame: { highScore: 0, games: 0 },
            hitTarget: { maxLevel: 0 },
            colorSettings: {
                'hit-target': {
                    ballColor: '#f0c030',
                    bgColor: '#dff4ff',
                    skyColor: '#9fd3ff',
                    groundColor: '#d39b55',
                    netColor: '#2b2b2b',
                    zoneColor: '#ffffff'
                },
                'finger-ball': {
                    ballColor: '#FF6B6B',
                    handColor: '#4CAF50',
                    bgColor: '#dff4ff',
                    textColor: '#333333',
                    effectColor: '#FFD700'
                },
                'reaction-game': {
                    bgColor: '#dff4ff',
                    skyColor: '#9fd3ff',
                    textColor: '#333333',
                    ballColor: '#FF6B6B',
                    playerColor: '#333333',
                    groundColor: '#70624b',
                    netColor: '#ffffff'
                }
            }
        };
        localStorage.setItem('players', JSON.stringify(players));
    }

    window.location.href = 'game/game.html';
});

document.getElementById('regInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('regBtn').click();
    }
});