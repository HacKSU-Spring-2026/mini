// Find Oursaurs - Memory Matching Game

// 8 unique images — one per pair, no repeats even on hard (8 pairs)
const dinoEmojis = [
    '/dino.png',
    '/dino2.png',
    '/dino3.png',
    '/dino4.png',
    '/dino5.png',
    '/caveman.png',
    '/caveman2.png',
    '/spear.png'
];

let gameState = {
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    matches: 0,
    gameRunning: false,
    difficulty: 'easy',
    timeElapsed: 0,
    startTime: 0,
    bestTime: localStorage.getItem('findOurSaursBest') || null
};

const gameBoardEl = document.getElementById('gameBoard');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const gameOverDiv = document.getElementById('gameOver');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Set initial best time display
if (gameState.bestTime) {
    bestEl.textContent = gameState.bestTime + 's';
}

// Difficulty buttons
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.difficulty = btn.dataset.difficulty;
        messageEl.textContent = `Difficulty set to ${btn.textContent}. Click START GAME!`;
    });
});

// Start Game
startBtn.addEventListener('click', startGame);

function startGame() {
    clearGame();
    setupCards();
    gameState.gameRunning = true;
    gameState.startTime = Date.now();
    gameOverDiv.style.display = 'none';
    messageEl.textContent = 'Game Started! Find matching pairs.';
    startTimer();
}

function getDifficultyConfig() {
    const configs = {
        easy: 8,
        medium: 12,
        hard: 16
    };
    return configs[gameState.difficulty];
}

function setupCards() {
    const count = getDifficultyConfig();
    const pairs = Math.floor(count / 2);

    // Create pairs
    let cards = [];
    for (let i = 0; i < pairs; i++) {
        const emoji = dinoEmojis[i % dinoEmojis.length];
        cards.push({ emoji, id: i * 2 });
        cards.push({ emoji, id: i * 2 + 1 });
    }

    // Shuffle
    cards = cards.sort(() => Math.random() - 0.5);
    gameState.cards = cards;

    // Render board
    renderBoard();
}

function cardContent(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'dino';
    // some images are naturally smaller — give them extra scale
    const small = ['/caveman2.png', '/dino3.png', '/dino4.png', '/dino5.png'];
    const size = small.includes(src) ? '95%' : '80%';
    img.style.cssText = `width:${size};height:${size};object-fit:contain;pointer-events:none;`;
    if (src === '/caveman2.png') img.style.transform = 'scale(2)';
    return img;
}

function renderBoard() {
    gameBoardEl.innerHTML = '';
    gameBoardEl.style.gridTemplateColumns = `repeat(${getGridCols()}, 1fr)`;

    gameState.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.index = index;

        if (gameState.matched.includes(index)) {
            cardEl.classList.add('matched');
            cardEl.appendChild(cardContent(card.emoji));
        } else if (gameState.flipped.includes(index)) {
            cardEl.classList.add('flipped');
            cardEl.appendChild(cardContent(card.emoji));
        } else {
            cardEl.textContent = '?';
        }

        cardEl.addEventListener('click', () => flipCard(index, cardEl));
        gameBoardEl.appendChild(cardEl);
    });
}

function getGridCols() {
    const count = getDifficultyConfig();
    if (count === 8) return 4;
    if (count === 12) return 4;
    return 4;
}

function flipCard(index, cardEl) {
    if (!gameState.gameRunning) return;
    if (gameState.flipped.includes(index)) return;
    if (gameState.matched.includes(index)) return;
    if (gameState.flipped.length >= 2) return;

    gameState.flipped.push(index);
    cardEl.classList.add('flipped');
    cardEl.innerHTML = '';
    cardEl.appendChild(cardContent(gameState.cards[index].emoji));

    if (gameState.flipped.length === 2) {
        gameState.moves++;
        movesEl.textContent = gameState.moves;

        checkMatch();
    }
}

function checkMatch() {
    const [index1, index2] = gameState.flipped;
    const card1 = gameState.cards[index1];
    const card2 = gameState.cards[index2];

    if (card1.emoji === card2.emoji) {
        // Match found
        gameState.matched.push(index1, index2);
        gameState.matches++;
        matchesEl.textContent = gameState.matches;
        messageEl.textContent = 'Match found!';
        gameState.flipped = [];
        renderBoard();

        // Check if won
        if (gameState.matched.length === gameState.cards.length) {
            endGame();
        }
    } else {
        // No match
        messageEl.textContent = 'Not a match. Try again!';
        setTimeout(() => {
            gameState.flipped = [];
            renderBoard();
        }, 1000);
    }
}

function clearGame() {
    gameState.flipped = [];
    gameState.matched = [];
    gameState.moves = 0;
    gameState.matches = 0;
    gameState.timeElapsed = 0;
    movesEl.textContent = '0';
    matchesEl.textContent = '0';
    timeEl.textContent = '0s';
    gameBoardEl.innerHTML = '';
}

let timerInterval;
function startTimer() {
    timerInterval = setInterval(() => {
        gameState.timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        timeEl.textContent = gameState.timeElapsed + 's';
    }, 100);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function endGame() {
    gameState.gameRunning = false;
    stopTimer();
    gameOverDiv.style.display = 'block';

    const winMessage = document.getElementById('winMessage');
    winMessage.innerHTML = `
        <strong>You matched all pairs!</strong><br>
        Moves: ${gameState.moves} | Time: ${gameState.timeElapsed}s
    `;

    // Save best time
    if (!gameState.bestTime || gameState.timeElapsed < parseInt(gameState.bestTime)) {
        gameState.bestTime = gameState.timeElapsed;
        localStorage.setItem('findOurSaursBest', gameState.bestTime);
        bestEl.textContent = gameState.bestTime + 's';
    }
}
