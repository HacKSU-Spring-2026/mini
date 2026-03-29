// Tribe vs Dino - Tower Defense Game

let gameState = {
    health: 100,
    wave: 1,
    kills: 0,
    gameRunning: false,
    enemies: [],
    score: 0,
    maxHealth: 100
};

const dinoEmojis = ['🦖', '🦕', '🦖', '🦕', '🦖'];

// DOM Elements
const enemyContainer = document.getElementById('enemyContainer');
const healthEl = document.getElementById('health');
const waveEl = document.getElementById('wave');
const killsEl = document.getElementById('kills');
const messageEl = document.getElementById('message');
const waveInfoEl = document.getElementById('waveInfo');
const startBtn = document.getElementById('startBtn');
const gameOverDiv = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreEl = document.getElementById('finalScore');

// Start Game
startBtn.addEventListener('click', startGame);

function startGame() {
    gameState = {
        health: 100,
        wave: 1,
        kills: 0,
        gameRunning: true,
        enemies: [],
        maxHealth: 100
    };
    gameOverDiv.style.display = 'none';
    startBtn.disabled = true;
    messageEl.textContent = '🎮 Game Started!';
    updateUI();
    spawnWave();
}

function spawnWave() {
    const dinosPerWave = 3 + gameState.wave;
    messageEl.textContent = `👇 Defeat all dinosaurs! (${dinosPerWave} incoming)`;
    waveInfoEl.textContent = `Wave ${gameState.wave} - ${dinosPerWave} dinosaurs incoming...`;

    for (let i = 0; i < dinosPerWave; i++) {
        setTimeout(() => {
            spawnDinosaur();
        }, i * 800);
    }
}

function spawnDinosaur() {
    if (!gameState.gameRunning) return;

    const dino = {
        id: Math.random(),
        emoji: dinoEmojis[Math.floor(Math.random() * dinoEmojis.length)],
        health: gameState.wave
    };

    gameState.enemies.push(dino);
    renderEnemy(dino);
}

function renderEnemy(dino) {
    const dinoEl = document.createElement('div');
    dinoEl.className = 'enemy';
    dinoEl.textContent = dino.emoji;
    dinoEl.id = `enemy-${dino.id}`;
    dinoEl.style.opacity = dino.health / gameState.wave;
    dinoEl.addEventListener('click', () => hitDinosaur(dino, dinoEl));

    enemyContainer.appendChild(dinoEl);
}

function hitDinosaur(dino, dinoEl) {
    if (!gameState.gameRunning) return;

    dino.health--;

    if (dino.health <= 0) {
        gameState.enemies = gameState.enemies.filter(e => e.id !== dino.id);
        gameState.kills++;
        gameState.score += gameState.wave * 10;
        messageEl.textContent = `✅ Dinosaur defeated! +${gameState.wave * 10} points`;
        dinoEl.style.opacity = '0';
        setTimeout(() => dinoEl.remove(), 300);

        // Check if wave complete
        if (gameState.enemies.length === 0) {
            setTimeout(nextWave, 1000);
        }
    } else {
        // Damage animation
        dinoEl.style.opacity = dino.health / gameState.wave;
        gameState.health -= 5;
        messageEl.textContent = `⚔️ Hit! But it's still alive...`;

        if (gameState.health <= 0) {
            endGame(false);
        }
    }

    updateUI();
}

function nextWave() {
    gameState.wave++;
    activeEnemies = 0;

    if (gameState.wave > 5) {
        endGame(true);
    } else {
        spawnWave();
    }
}

function updateUI() {
    healthEl.textContent = Math.max(0, gameState.health);
    waveEl.textContent = gameState.wave;
    killsEl.textContent = gameState.kills;
}

function endGame(won) {
    gameState.gameRunning = false;
    gameOverDiv.style.display = 'block';
    startBtn.disabled = false;
    enemyContainer.innerHTML = '';

    if (won) {
        gameOverTitle.textContent = '🎉 Victory!';
        gameOverMessage.textContent = 'Your tribe has defeated all the dinosaurs!';
        messageEl.textContent = '🏆 You survived!';
    } else {
        gameOverTitle.textContent = '☠️ Game Over!';
        gameOverMessage.textContent = 'Your tribe has been defeated!';
        messageEl.textContent = '💀 Your tribe has fallen...';
    }

    finalScoreEl.textContent = gameState.kills;
}

// Advanced mechanics (optional)
document.getElementById('spikeBtn').addEventListener('click', () => {
    if (gameState.gameRunning) {
        messageEl.textContent = '✨ Spike trap placed! (Slows enemies)';
    }
});

document.getElementById('fireBtn').addEventListener('click', () => {
    if (gameState.gameRunning) {
        messageEl.textContent = '✨ Fire trap placed! (Damages enemies)';
    }
});
