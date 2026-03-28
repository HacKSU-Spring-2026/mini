const GAME_DURATION = 30; // seconds
const HOLE_COUNT    = 9;
const GOLDEN_CHANCE = 0.15; // 15% chance a crab is golden

const grid        = document.getElementById('grid');
const scoreEl     = document.getElementById('score');
const missedEl    = document.getElementById('missed');
const timerEl     = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const startScreen = document.getElementById('start-screen');
const gameScreen  = document.getElementById('game-screen');
const doneScreen  = document.getElementById('done-screen');
const startBtn    = document.getElementById('start-btn');
const restartBtn  = document.getElementById('restart-btn');

let holes       = [];
let score       = 0;
let hits        = 0;
let missed      = 0;
let timeLeft    = GAME_DURATION;
let gameTimer   = null;
let spawnTimer  = null;
let activeHoles = new Array(HOLE_COUNT).fill(false);
let holeTimeouts = new Array(HOLE_COUNT).fill(null);

// Build the 3x3 grid
function buildGrid() {
  grid.innerHTML = '';
  holes = [];
  for (let i = 0; i < HOLE_COUNT; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.innerHTML = '<span class="crab">🦀</span>';
    hole.addEventListener('click', () => whack(i, hole));
    grid.appendChild(hole);
    holes.push(hole);
  }
}

function showCrab(index) {
  if (activeHoles[index]) return;
  activeHoles[index] = true;

  const hole = holes[index];
  const isGolden = Math.random() < GOLDEN_CHANCE;
  hole.dataset.golden = isGolden ? '1' : '0';
  hole.classList.toggle('golden', isGolden);
  hole.classList.add('active');

  // how long the crab stays up — gets shorter as time runs out
  const stayMs = 600 + timeLeft * 28;

  holeTimeouts[index] = setTimeout(() => {
    if (activeHoles[index]) {
      // crab escaped
      hideCrab(index, false);
      missed++;
      missedEl.textContent = missed;
    }
  }, stayMs);
}

function hideCrab(index, wasWhacked) {
  activeHoles[index] = false;
  clearTimeout(holeTimeouts[index]);
  const hole = holes[index];
  if (wasWhacked) {
    hole.classList.add('whacked');
    setTimeout(() => {
      hole.classList.remove('active', 'whacked', 'golden');
    }, 150);
  } else {
    hole.classList.remove('active', 'golden');
  }
}

function whack(index, hole) {
  if (!activeHoles[index]) return;

  const isGolden = hole.dataset.golden === '1';
  const points   = isGolden ? 3 : 1;

  score += points;
  hits++;
  scoreEl.textContent = score;

  // floating score popup
  const pop = document.createElement('span');
  pop.className = 'pop-score' + (isGolden ? ' gold' : '');
  pop.textContent = '+' + points;
  hole.appendChild(pop);
  setTimeout(() => pop.remove(), 600);

  hideCrab(index, true);
}

function spawnRandom() {
  // pick a random inactive hole
  const inactive = [];
  for (let i = 0; i < HOLE_COUNT; i++) {
    if (!activeHoles[i]) inactive.push(i);
  }
  if (inactive.length === 0) return;
  const pick = inactive[Math.floor(Math.random() * inactive.length)];
  showCrab(pick);
}

function startSpawning() {
  // spawn interval speeds up as time runs out
  function scheduleNext() {
    const interval = 300 + timeLeft * 25;
    spawnTimer = setTimeout(() => {
      spawnRandom();
      scheduleNext();
    }, interval);
  }
  scheduleNext();
}

function startGame() {
  score    = 0;
  hits     = 0;
  missed   = 0;
  timeLeft = GAME_DURATION;

  scoreEl.textContent  = '0';
  missedEl.textContent = '0';
  timerEl.textContent  = GAME_DURATION;
  progressBar.style.width = '100%';

  activeHoles.fill(false);
  holeTimeouts.fill(null);

  buildGrid();

  startScreen.style.display = 'none';
  doneScreen.style.display  = 'none';
  gameScreen.style.display  = 'flex';

  startSpawning();

  gameTimer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    progressBar.style.width = (timeLeft / GAME_DURATION * 100) + '%';
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(gameTimer);
  clearTimeout(spawnTimer);

  // hide any remaining crabs
  for (let i = 0; i < HOLE_COUNT; i++) {
    if (activeHoles[i]) hideCrab(i, false);
  }

  const total    = hits + missed;
  const accuracy = total === 0 ? 0 : Math.round((hits / total) * 100);

  document.getElementById('final-score').textContent    = score;
  document.getElementById('final-hits').textContent     = hits;
  document.getElementById('final-missed').textContent   = missed;
  document.getElementById('final-accuracy').textContent = accuracy + '%';

  gameScreen.style.display = 'none';
  doneScreen.style.display = 'flex';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
