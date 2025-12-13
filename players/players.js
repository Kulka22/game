function loadLeaderboard() {
    const players = JSON.parse(localStorage.getItem('players')) || {};
    const currentPlayer = localStorage.getItem('currentPlayer');

    const playersArray = Object.values(players);

    const fingerballSorted = [...playersArray]
        .filter(p => p.fingerBall.highScore > 0)
        .sort((a, b) => b.fingerBall.highScore - a.fingerBall.highScore);

    const fingerballTable = document.getElementById('fingerball-table').querySelector('tbody');
    fingerballTable.innerHTML = '';

    fingerballSorted.forEach((player, index) => {
        const row = fingerballTable.insertRow();
        if (player.name === currentPlayer) row.classList.add('current-player');

        row.innerHTML = `
                    <td class="rank">${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.fingerBall.highScore}</td>
                    <td>${player.fingerBall.games || 0}</td>
                `;
    });

    const reactionSorted = [...playersArray]
        .filter(p => p.reactionGame.highScore > 0)
        .sort((a, b) => b.reactionGame.highScore - a.reactionGame.highScore);

    const reactionTable = document.getElementById('reaction-table').querySelector('tbody');
    reactionTable.innerHTML = '';

    reactionSorted.forEach((player, index) => {
        const row = reactionTable.insertRow();
        if (player.name === currentPlayer) row.classList.add('current-player');

        row.innerHTML = `
                    <td class="rank">${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${player.reactionGame.highScore}</td>
                    <td>${player.reactionGame.games || 0}</td>
                `;
    });
}

loadLeaderboard();