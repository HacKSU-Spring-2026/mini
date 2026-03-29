const scoreEl    = document.getElementById('score');
const missedEl   = document.getElementById('missed');
const timerEl    = document.getElementById('timer');
const bestEl     = document.getElementById('best');
const gridEl     = document.getElementById('grid');
const startOverlay  = document.getElementById('start-overlay');
const endOverlay    = document.getElementById('end-overlay');
const endSummary    = document.getElementById('end-summary');
const startBtn   = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const COLS         = 3;
const TOTAL_HOLES  = COLS * COLS;   // 9
const GAME_SECS    = 30;
const MAX_MISSED   = 10;

// how long a crab stays up (ms), shrinks as game progresses
const UP_TIME_START = 1400;
const UP_TIME_MIN   = 650;

// how often a new crab pops up (ms)
const SPAWN_START   = 900;
const SPAWN_MIN     = 380;

let score    = 0;
let missed   = 0;
let timeLeft = GAME_SECS;
let running  = false;
let holes    = [];   // { el, crabEl, active, timer }
let spawnTimer    = null;
let countdownTimer = null;
let tick     = 0;
let best     = parseInt(localStorage.getItem('crabHuntBest') || '0');

if (best) bestEl.textContent = best;

// ── Build the 3×3 grid ──────────────────────────────────────────
function buildGrid() {
    gridEl.innerHTML = '';
    holes = [];
    for (let i = 0; i < TOTAL_HOLES; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';

        const crab = document.createElement('div');
        crab.className = 'crab';
        crab.textContent = '🦀';
        hole.appendChild(crab);

        hole.addEventListener('click', () => smack(i));
        gridEl.appendChild(hole);

        holes.push({ el: hole, crabEl: crab, active: false, timer: null, golden: false });
    }
}

buildGrid();

// ── Game flow ────────────────────────────────────────────────────
function startGame() {
    score    = 0;
    missed   = 0;
    timeLeft = GAME_SECS;
    tick     = 0;
    running  = true;

    // reset all holes
    holes.forEach(h => {
        clearTimeout(h.timer);
        h.active = false;
        h.golden = false;
        h.el.className = 'hole';
        h.crabEl.textContent = '🦀';
        h.crabEl.style.filter = '';
    });

    startOverlay.classList.add('hidden');
    endOverlay.classList.add('hidden');
    updateStats();

    scheduleSpawn();
    countdownTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    running = false;
    clearTimeout(spawnTimer);
    clearInterval(countdownTimer);
    holes.forEach(h => {
        clearTimeout(h.timer);
        h.active = false;
        h.el.className = 'hole';
    });

    if (score > best) {
        best = score;
        localStorage.setItem('crabHuntBest', best);
        bestEl.textContent = best;
    }

    endSummary.textContent = `You smacked ${score} crabs! ${missed} got away.`;
    endOverlay.classList.remove('hidden');
}

function updateStats() {
    scoreEl.textContent  = score;
    missedEl.textContent = missed;
    timerEl.textContent  = timeLeft;
}

// ── Spawning ─────────────────────────────────────────────────────
function scheduleSpawn() {
    if (!running) return;
    const progress  = Math.min(1, tick / 25);
    const delay     = SPAWN_START - (SPAWN_START - SPAWN_MIN) * progress;
    spawnTimer = setTimeout(() => {
        tick++;
        popCrab();
        scheduleSpawn();
    }, delay);
}

function popCrab() {
    // pick a random hole that isn't already active
    const idle = holes.filter(h => !h.active);
    if (!idle.length) return;

    const h = idle[Math.floor(Math.random() * idle.length)];
    const isGolden = Math.random() < 0.15;
    const progress = Math.min(1, tick / 25);
    const upTime   = UP_TIME_START - (UP_TIME_START - UP_TIME_MIN) * progress;

    h.active = true;
    h.golden = isGolden;
    h.crabEl.textContent = isGolden ? '🦀' : '🦀';
    h.crabEl.style.filter = isGolden ? 'sepia(1) saturate(4) hue-rotate(10deg) brightness(1.4)' : '';
    h.el.classList.add('up');

    h.timer = setTimeout(() => {
        if (h.active) {
            // crab escaped
            h.active = false;
            h.el.classList.remove('up');
            if (running) {
                missed++;
                updateStats();
                if (missed >= MAX_MISSED) endGame();
            }
        }
    }, upTime);
}

// ── Smacking ─────────────────────────────────────────────────────
function smack(index) {
    if (!running) return;
    const h = holes[index];
    if (!h.active) return;

    clearTimeout(h.timer);
    h.active = false;

    const pts = h.golden ? 3 : 1;
    score += pts;
    updateStats();

    // smack animation
    h.el.classList.remove('up');
    h.el.classList.add('smacked');
    setTimeout(() => h.el.classList.remove('smacked'), 350);

    // floating score pop
    const pop = document.createElement('div');
    pop.className = 'pop' + (h.golden ? ' golden' : '');
    pop.textContent = '+' + pts;
    h.el.appendChild(pop);
    setTimeout(() => pop.remove(), 600);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
