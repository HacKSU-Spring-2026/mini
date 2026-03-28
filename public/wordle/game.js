const WORDS = [
  'APPLE', 'GRAPE', 'LEMON', 'PEACH', 'BERRY',
  'PLUMB', 'CHERRY', 'ORANGE', 'MELON', 'BANANA'
];

const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard');
const message = document.getElementById('message');
const gamesEl = document.getElementById('games');
const winsEl = document.getElementById('wins');
const streakEl = document.getElementById('streak');
const playAgain = document.getElementById('play-again');

let currentWord = '';
let currentGuess = '';
let currentRow = 0;
let gameOver = false;
let stats = { games: 0, wins: 0, streak: 0 };

const keyboardLayout = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

function initGame() {
  currentWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentGuess = '';
  currentRow = 0;
  gameOver = false;
  message.textContent = '';
  playAgain.classList.remove('visible');

  // Create board
  gameBoard.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${i}-${j}`;
      gameBoard.appendChild(tile);
    }
  }

  // Create keyboard
  keyboard.innerHTML = '';
  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      if (key === 'ENTER' || key === 'BACKSPACE') keyDiv.classList.add('wide');
      keyDiv.textContent = key === 'BACKSPACE' ? '⌫' : key;
      keyDiv.addEventListener('click', () => handleKey(key));
      rowDiv.appendChild(keyDiv);
    });
    keyboard.appendChild(rowDiv);
  });

  updateStats();
}

function handleKey(key) {
  if (gameOver) return;

  if (key === 'ENTER') {
    if (currentGuess.length === 5) {
      checkGuess();
    }
  } else if (key === 'BACKSPACE') {
    if (currentGuess.length > 0) {
      currentGuess = currentGuess.slice(0, -1);
      updateBoard();
    }
  } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
    currentGuess += key;
    updateBoard();
  }
}

function updateBoard() {
  for (let j = 0; j < 5; j++) {
    const tile = document.getElementById(`tile-${currentRow}-${j}`);
    tile.textContent = currentGuess[j] || '';
    tile.classList.toggle('filled', !!currentGuess[j]);
  }
}

function checkGuess() {
  const guess = currentGuess;
  const word = currentWord;
  const result = Array(5).fill('absent');

  // First pass: correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      result[i] = 'correct';
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'absent' && word.includes(guess[i])) {
      // Check if there's an unmatched occurrence
      let unmatched = false;
      for (let j = 0; j < 5; j++) {
        if (guess[j] === guess[i] && result[j] === 'correct') {
          unmatched = true;
          break;
        }
      }
      if (!unmatched) result[i] = 'present';
    }
  }

  // Update tiles
  for (let j = 0; j < 5; j++) {
    const tile = document.getElementById(`tile-${currentRow}-${j}`);
    tile.classList.add(result[j]);
  }

  // Update keyboard
  for (let j = 0; j < 5; j++) {
    const key = document.querySelector(`.key:not(.correct):not(.present):not(.absent)`);
    if (key && key.textContent === guess[j]) {
      key.classList.add(result[j]);
    }
  }

  if (guess === word) {
    message.textContent = 'You win!';
    gameOver = true;
    stats.wins++;
    stats.streak++;
    playAgain.classList.add('visible');
  } else if (currentRow === 5) {
    message.textContent = `Game over! The word was ${word}`;
    gameOver = true;
    stats.streak = 0;
    playAgain.classList.add('visible');
  } else {
    currentRow++;
    currentGuess = '';
  }

  stats.games++;
  updateStats();
}

function updateStats() {
  gamesEl.textContent = stats.games;
  winsEl.textContent = stats.wins;
  streakEl.textContent = stats.streak;
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
    handleKey(key);
  }
});

playAgain.addEventListener('click', initGame);

initGame();