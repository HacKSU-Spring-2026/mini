// Cave & dino themed 5-letter word list
const WORDS = [
  'STONE', 'SPEAR', 'TRIBE', 'FLINT', 'CAVES',
  'BONES', 'CLAWS', 'FANGS', 'ROARS', 'STOMP',
  'TRAPS', 'HUNTS', 'GROWL', 'SCALE', 'HORNS',
  'TAILS', 'TEETH', 'SWAMP', 'MARSH', 'FERNS',
  'ROCKS', 'CLUBS', 'FIRES', 'SMOKE', 'ASHES',
  'BEAST', 'GIANT', 'SWIFT', 'BRAVE', 'GROAN',
  'STOMP', 'CRUSH', 'GNASH', 'PROWL', 'STALK',
  'HATCH', 'SHELL', 'SPINE', 'CREST', 'SNOUT',
  'TALON', 'TREKS', 'HERDS', 'PACKS', 'ROOST',
  'BLAZE', 'FROST', 'STORM', 'FLOOD', 'EARTH'
];

const gameBoard = document.getElementById('game-board');
const keyboard  = document.getElementById('keyboard');
const message   = document.getElementById('message');
const gamesEl   = document.getElementById('games');
const winsEl    = document.getElementById('wins');
const streakEl  = document.getElementById('streak');
const playAgain = document.getElementById('play-again');

let currentWord  = '';
let currentGuess = '';
let currentRow   = 0;
let gameOver     = false;
let stats        = { games: 0, wins: 0, streak: 0 };

const keyboardLayout = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','BACKSPACE']
];

function initGame() {
  currentWord  = WORDS[Math.floor(Math.random() * WORDS.length)];
  currentGuess = '';
  currentRow   = 0;
  gameOver     = false;
  message.textContent = '';
  playAgain.classList.remove('visible');

  // board
  gameBoard.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${i}-${j}`;
      gameBoard.appendChild(tile);
    }
  }

  // keyboard
  keyboard.innerHTML = '';
  keyboardLayout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row';
    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.className = 'key';
      keyDiv.dataset.key = key;
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
    if (currentGuess.length === 5) checkGuess();
    else showMessage('Not enough letters', 800);
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
  const word  = currentWord;
  const result = Array(5).fill('absent');
  const wordArr  = word.split('');
  const guessArr = guess.split('');

  // pass 1 — correct positions
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === wordArr[i]) {
      result[i] = 'correct';
      wordArr[i]  = null;
      guessArr[i] = null;
    }
  }

  // pass 2 — present letters
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === null) continue;
    const idx = wordArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i]    = 'present';
      wordArr[idx] = null;
    }
  }

  // colour tiles
  for (let j = 0; j < 5; j++) {
    const tile = document.getElementById(`tile-${currentRow}-${j}`);
    tile.classList.remove('filled');
    tile.classList.add(result[j]);
  }

  // colour keyboard keys — only upgrade, never downgrade
  const priority = { correct: 3, present: 2, absent: 1 };
  for (let j = 0; j < 5; j++) {
    const keyEl = keyboard.querySelector(`[data-key="${guess[j]}"]`);
    if (!keyEl) continue;
    const cur = ['correct','present','absent'].find(c => keyEl.classList.contains(c));
    if (!cur || priority[result[j]] > priority[cur]) {
      keyEl.classList.remove('correct','present','absent');
      keyEl.classList.add(result[j]);
    }
  }

  if (guess === word) {
    const msgs = ['Unga bunga!', 'Cave champion!', 'Dino slayer!', 'Tribe approves!', 'Prehistoric genius!'];
    showMessage(msgs[Math.min(currentRow, msgs.length - 1)]);
    gameOver = true;
    stats.wins++;
    stats.streak++;
    stats.games++;
    updateStats();
    playAgain.classList.add('visible');
  } else if (currentRow === 5) {
    showMessage(`The word was ${word}`);
    gameOver = true;
    stats.streak = 0;
    stats.games++;
    updateStats();
    playAgain.classList.add('visible');
  } else {
    currentRow++;
    currentGuess = '';
    stats.games++;
    updateStats();
  }
}

function showMessage(text, duration = 0) {
  message.textContent = text;
  if (duration) setTimeout(() => { if (message.textContent === text) message.textContent = ''; }, duration);
}

function updateStats() {
  gamesEl.textContent  = stats.games;
  winsEl.textContent   = stats.wins;
  streakEl.textContent = stats.streak;
}

document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) handleKey(key);
});

playAgain.addEventListener('click', initGame);
initGame();
