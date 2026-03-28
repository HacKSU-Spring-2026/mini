const TOTAL_ROUNDS = 5;

const gameArea   = document.getElementById('game-area');
const message    = document.getElementById('message');
const subMessage = document.getElementById('sub-message');
const lastEl     = document.getElementById('last');
const bestEl     = document.getElementById('best');
const avgEl      = document.getElementById('avg');
const dotsEl     = document.getElementById('round-dots');
const resultsEl  = document.getElementById('results');
const playAgain  = document.getElementById('play-again');

let state     = 'idle';
let startTime = 0;
let timer     = null;
let round     = 0;
let times     = [];

function setState(s) {
  state = s;
  gameArea.classList.remove('waiting', 'ready', 'too-soon');
  if (s === 'waiting')  gameArea.classList.add('waiting');
  if (s === 'ready')    gameArea.classList.add('ready');
  if (s === 'too-soon') gameArea.classList.add('too-soon');
}

function buildDots() {
  dotsEl.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < times.length ? ' done' : i === times.length ? ' active' : '');
    dotsEl.appendChild(d);
  }
}

function startRound() {
  setState('waiting');
  message.textContent = 'Wait for green...';
  subMessage.textContent = '';

  const delay = 1500 + Math.random() * 3500;
  timer = setTimeout(() => {
    setState('ready');
    message.textContent = 'Click!';
    subMessage.textContent = '';
    startTime = performance.now();
  }, delay);
}

function recordResult(ms) {
  times.push(ms);
  lastEl.textContent = ms + ' ms';
  const best = Math.min(...times);
  const avg  = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  bestEl.textContent = best + ' ms';
  avgEl.textContent  = avg  + ' ms';
}

function showDone() {
  setState('done');
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  gameArea.classList.add('hidden');
  dotsEl.classList.add('hidden');
  resultsEl.classList.add('done');
  playAgain.classList.add('visible');
  document.querySelector('#results .result-card:first-child .label').textContent = 'Average';
  avgEl.textContent = avg + ' ms';
}

function reset() {
  round = 0;
  times = [];
  lastEl.textContent = '--';
  bestEl.textContent = '--';
  avgEl.textContent  = '--';
  buildDots();
  setState('idle');
  message.textContent = 'Click to start';
  subMessage.textContent = '';
  gameArea.classList.remove('hidden');
  dotsEl.classList.remove('hidden');
  resultsEl.classList.remove('done');
  playAgain.classList.remove('visible');
  document.querySelector('#results .result-card:first-child .label').textContent = 'Last';
}

gameArea.addEventListener('click', () => {
  if (state === 'waiting') {
    clearTimeout(timer);
    setState('too-soon');
    message.textContent = 'Too soon!';
    subMessage.textContent = 'Click to try this round again';
    return;
  }
  if (state === 'too-soon') { startRound(); return; }
  if (state === 'ready') {
    const ms = Math.round(performance.now() - startTime);
    recordResult(ms);
    buildDots();
    if (round >= TOTAL_ROUNDS) {
      showDone();
    } else {
      round++;
      setState('idle');
      message.textContent = `${ms} ms — Click for next round`;
      subMessage.textContent = `Round ${round} of ${TOTAL_ROUNDS}`;
    }
    return;
  }
  if (state === 'idle') {
    if (round === 0) round = 1;
    startRound();
  }
});

playAgain.addEventListener('click', () => {
  reset();
  round = 1;
  buildDots();
  startRound();
});

gameArea.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') gameArea.click();
});

buildDots();
