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
const arrow      = document.querySelector('.arrow');

let state     = 'idle';
let startTime = 0;
let timer     = null;
let hitTimer  = null;
let round     = 0;
let times     = [];

function setState(s) {
  state = s;
  gameArea.classList.remove('waiting', 'ready', 'too-soon', 'hit');
  if (s === 'waiting')  gameArea.classList.add('waiting');
  if (s === 'ready')    gameArea.classList.add('ready');
  if (s === 'too-soon') gameArea.classList.add('too-soon');
  if (s === 'hit')      gameArea.classList.add('hit');
}

function buildDots() {
  dotsEl.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < times.length ? ' done' : i === times.length ? ' active' : '');
    dotsEl.appendChild(d);
  }
}

function resetArrow() {
  arrow.classList.remove('shoot');
  clearTimeout(hitTimer);
}

function startRound() {
  setState('waiting');
  resetArrow();
  message.textContent = 'Wait for the arrow...';
  subMessage.textContent = 'Get ready to dodge!!!';

  const delay = 1500 + Math.random() * 3500;
  timer = setTimeout(() => {
    setState('ready');
    arrow.classList.add('shoot');
    message.textContent = 'React!';
    subMessage.textContent = 'Click before the arrow hits the wall!';
    startTime = performance.now();
    hitTimer = setTimeout(() => {
      if (state === 'ready') {
        setState('hit');
        resetArrow();
        message.textContent = 'Hit! You lose';
        subMessage.textContent = 'Click to try again';
      }
    }, 450);
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
  resetArrow();
  setState('done');
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  gameArea.classList.add('hidden');
  dotsEl.classList.add('hidden');
  resultsEl.classList.add('done');
  playAgain.classList.add('visible');
  document.querySelector('#results .stat-card:first-child .label').textContent = 'Average';
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
  resetArrow();
  message.textContent = 'Click to start';
  subMessage.textContent = '';
  gameArea.classList.remove('hidden');
  dotsEl.classList.remove('hidden');
  resultsEl.classList.remove('done');
  playAgain.classList.remove('visible');
  document.querySelector('#results .stat-card:first-child .label').textContent = 'Last';
}

gameArea.addEventListener('click', () => {
  if (state === 'waiting') {
    clearTimeout(timer);
    resetArrow();
    setState('too-soon');
    message.textContent = 'Too soon!';
    subMessage.textContent = 'Click to try this round again';
    return;
  }
  if (state === 'too-soon' || state === 'hit') { startRound(); return; }
  if (state === 'ready') {
    const ms = Math.round(performance.now() - startTime);
    clearTimeout(hitTimer);
    resetArrow();
    recordResult(ms);
    round++;
    buildDots();
    if (round >= TOTAL_ROUNDS) {
      showDone();
    } else {
      setState('idle');
      message.textContent = `${ms} ms — Click for next round`;
      subMessage.textContent = `Round ${round + 1} of ${TOTAL_ROUNDS}`;
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
