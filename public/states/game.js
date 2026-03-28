const ALL_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const stateInput  = document.getElementById('state-input');
const foundCount  = document.getElementById('found-count');
const timerEl     = document.getElementById('timer');
const grid        = document.getElementById('grid');
const giveUpBtn   = document.getElementById('give-up');
const doneScreen  = document.getElementById('done-screen');
const finalCount  = document.getElementById('final-count');
const finalTime   = document.getElementById('final-time');
const finalMissed = document.getElementById('final-missed');
const playAgain   = document.getElementById('play-again');

let found        = new Set(); // normalized names the user has guessed
let startTime    = null;
let timerInterval = null;
let started      = false;
let slots        = {}; // maps normalized name → slot element

// normalize for comparison: lowercase, trim, collapse spaces
function normalize(s) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildGrid() {
  grid.innerHTML = '';
  slots = {};
  // sort alphabetically for the grid display
  [...ALL_STATES].sort().forEach(state => {
    const div = document.createElement('div');
    div.className = 'state-slot';
    div.textContent = ''; // hidden until found
    div.dataset.state = normalize(state);
    grid.appendChild(div);
    slots[normalize(state)] = div;
  });
}

function startTimer() {
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = secs + 's';
  }, 200);
}

function flash(cls) {
  stateInput.classList.add(cls);
  setTimeout(() => stateInput.classList.remove(cls), 300);
}

function finish(gaveUp) {
  clearInterval(timerInterval);
  stateInput.disabled = true;
  giveUpBtn.disabled  = true;

  const secs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

  // reveal any unfound states in red
  ALL_STATES.forEach(state => {
    const key  = normalize(state);
    const slot = slots[key];
    slot.textContent = state;
    if (!found.has(key)) slot.classList.add('revealed');
  });

  finalCount.textContent  = found.size;
  finalTime.textContent   = secs + 's';
  finalMissed.textContent = 50 - found.size;

  doneScreen.classList.add('visible');
}

function reset() {
  clearInterval(timerInterval);
  found    = new Set();
  started  = false;
  startTime = null;

  stateInput.value    = '';
  stateInput.disabled = false;
  giveUpBtn.disabled  = false;
  timerEl.textContent = '0s';
  foundCount.textContent = '0 / 50';

  doneScreen.classList.remove('visible');
  buildGrid();
  stateInput.focus();
}

stateInput.addEventListener('input', () => {
  const val = normalize(stateInput.value);

  if (!started && val.length > 0) {
    started   = true;
    startTime = Date.now();
    startTimer();
  }

  if (ALL_STATES.map(normalize).includes(val) && !found.has(val)) {
    found.add(val);
    const slot = slots[val];
    // find the original cased name
    const original = ALL_STATES.find(s => normalize(s) === val);
    slot.textContent = original;
    slot.classList.add('found');
    foundCount.textContent = `${found.size} / 50`;
    flash('correct-flash');
    stateInput.value = '';

    if (found.size === 50) finish(false);
  }
});

giveUpBtn.addEventListener('click', () => finish(true));
playAgain.addEventListener('click', reset);

// init
buildGrid();
stateInput.focus();
