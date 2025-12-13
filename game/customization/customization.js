let currentGame = 'hit-target';
let currentColorSettings = null;

document.addEventListener('DOMContentLoaded', function () {
    currentColorSettings = loadColorSettings();
    console.log(currentColorSettings);
    updateColorInputs(currentGame);
    setupEventListeners();
});

function setupEventListeners() {
    document.querySelectorAll('.game-option').forEach(option => {
        option.addEventListener('click', function () {
            const game = this.dataset.game;
            switchGame(game);
        });
    });
}

function loadColorSettings() {
    const playerName = localStorage.getItem('currentPlayer');
    if (!playerName) return;

    let players = JSON.parse(localStorage.getItem('players')) || {};
    if (!players[playerName]) return;

    return players[playerName].colorSettings;
}

function switchGame(game) {
    currentGame = game;

    document.querySelectorAll('.game-option').forEach(option => {
        option.classList.toggle('active', option.dataset.game === game);
    });

    document.querySelectorAll('.color-customization').forEach(section => {
        section.classList.toggle('active', section.dataset.game === game);
    });

    updateColorInputs(game);
}

function updateColorInputs(game) {
    const settings = currentColorSettings[game];
    if (!settings) return;

    Object.keys(settings).forEach(key => {
        let gameNameTemp;
        if (game == 'hit-target')
            gameNameTemp = 'ht';
        else if (game == 'finger-ball')
            gameNameTemp = 'fb';
        else if (game == 'reaction-game')
            gameNameTemp = 'rg';

        console.log(settings['bgColor']);
        const input = document.getElementById(`${gameNameTemp}-${key}`);

        if (input) {
            console.log(key);
            input.value = settings[key];
        }
    });
}

function saveAllSettings() {
    const playerName = localStorage.getItem('currentPlayer');
    if (!playerName) return;

    let players = JSON.parse(localStorage.getItem('players')) || {};
    if (!players[playerName]) return;

    players[playerName].colorSettings = currentColorSettings;
    localStorage.setItem('players', JSON.stringify(players));
}

function saveCurrentGameColors() {
    const settings = currentColorSettings[currentGame];
    if (!settings) return;

    if (currentGame === 'finger-ball') {
        settings.ballColor = document.getElementById('fb-ballColor').value;
        settings.bgColor = document.getElementById('fb-bgColor').value;
        settings.handColor = document.getElementById('fb-handColor').value;
        settings.bgColor = document.getElementById('fb-bgColor').value;
        settings.textColor = document.getElementById('fb-textColor').value;
        settings.effectColor = document.getElementById('fb-effectColor').value;
    }
    else if (currentGame === 'hit-target') {
        settings.ballColor = document.getElementById('ht-ballColor').value;
        settings.fieldColor = document.getElementById('ht-fieldColor').value;
        settings.groundColor = document.getElementById('ht-groundColor').value;
        settings.netColor = document.getElementById('ht-netColor').value;
        settings.zoneColor = document.getElementById('ht-zoneColor').value;
    }
    else if (currentGame === 'reaction-game') {
        settings.bgColor = document.getElementById('rg-bgColor').value;
        settings.skyColor = document.getElementById('rg-skyColor').value;
        settings.textColor = document.getElementById('rg-textColor').value;
        settings.ballColor = document.getElementById('rg-ballColor').value;
        settings.playerColor = document.getElementById('rg-playerColor').value;
        settings.groundColor = document.getElementById('rg-groundColor').value;
        settings.netColor = document.getElementById('rg-netColor').value;
    }

    saveAllSettings();
    console.log('Сохранены ручные настройки для', currentGame, ':', settings);
}

function applyColors(game) {
    saveCurrentGameColors();

    saveAllSettings();

    showNotification(`🎨 Настройки для "${getGameName(game)}" сохранены!`);
    console.log('Применены цвета для', game, ':', currentColorSettings[game]);
}

function resetGameColors(game) {
    const defaults = {
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
    };

    if (defaults[game]) {
        currentColorSettings[game] = { ...defaults[game] };
        updateColorInputs(game);
        saveAllSettings();
        showNotification(`🔄 Цвета для "${getGameName(game)}" сброшены`);
    }
}

function getGameName(game) {
    const names = {
        'hit-target': 'Попади в цель',
        'finger-ball': 'FingerBall',
        'reaction-game': 'Игры на реакцию'
    };
    return names[game] || game;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

window.applyColors = applyColors;
window.resetGameColors = resetGameColors;