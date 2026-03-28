const PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the mountains casting long shadows across the valley floor.",
  "Typing speed is a skill that improves with consistent practice and focus. The more you type without looking at the keyboard the faster and more accurate you will become over time.",
  "A journey of a thousand miles begins with a single step. Every expert was once a beginner who refused to give up when things became difficult or uncertain.",
  "The universe is under no obligation to make sense to you. Science is not a belief system but a method of discovering what is actually true about the world around us.",
  "Good code is like a good joke — it needs no explanation. Writing clean readable software is one of the most valuable skills a developer can cultivate throughout their career.",
];

const paragraphBox  = document.getElementById('paragraph-box');
const input         = document.getElementById('input');
const wpmEl         = document.getElementById('wpm');
const accuracyEl    = document.getElementById('accuracy');
const timerEl       = document.getElementById('timer');
const doneScreen    = document.getElementById('done-screen');
const finalWpm      = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const finalTime     = document.getElementById('final-time');
const finalErrors   = document.getElementById('final-errors');
const restartBtn    = document.getElementById('restart');

let words        = [];   // array of word strings from the chosen paragraph
let charSpans    = [];   // flat array of all character <span> elements
let wordBoundaries = []; // index in charSpans where each word starts
let startTime    = null; // when the user typed the first character
let timerInterval = null;
let totalTyped   = 0;    // total keystrokes made
let errors       = 0;    // total wrong characters
let charIndex    = 0;    // current position in the flat char array
let started      = false;

function pickParagraph() {
  return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
}

function buildParagraph(text) {
  paragraphBox.innerHTML = '';
  charSpans = [];
  wordBoundaries = [];

  words = text.split(' ');
  words.forEach((word, wi) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';

    wordBoundaries.push(charSpans.length); // record where this word starts

    word.split('').forEach(ch => {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = ch;
      charSpans.push(s);
      wordSpan.appendChild(s);
    });

    // add a space span between words (not after the last one)
    if (wi < words.length - 1) {
      const space = document.createElement('span');
      space.className = 'char';
      space.textContent = ' ';
      charSpans.push(space);
      wordSpan.appendChild(space);
    }

    paragraphBox.appendChild(wordSpan);
  });

  setCursor(0);
}

function setCursor(index) {
  // remove cursor class from all chars
  charSpans.forEach(s => s.classList.remove('cursor'));
  if (index < charSpans.length) charSpans[index].classList.add('cursor');
}

function calcWpm() {
  if (!startTime) return 0;
  const minutes = (Date.now() - startTime) / 60000;
  // count correctly completed words (a word is correct if all its chars are green)
  let correctWords = 0;
  wordBoundaries.forEach((start, wi) => {
    const end = wi < wordBoundaries.length - 1 ? wordBoundaries[wi + 1] - 1 : charSpans.length;
    const allCorrect = charSpans.slice(start, end).every(s => s.classList.contains('correct'));
    if (allCorrect) correctWords++;
  });
  return Math.round(correctWords / minutes);
}

function calcAccuracy() {
  if (totalTyped === 0) return 100;
  return Math.round(((totalTyped - errors) / totalTyped) * 100);
}

function startTimer() {
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = secs + 's';
    wpmEl.textContent = calcWpm();
    accuracyEl.textContent = calcAccuracy() + '%';
  }, 200);
}

function finish() {
  clearInterval(timerInterval);
  input.disabled = true;

  const secs = Math.floor((Date.now() - startTime) / 1000);
  const wpm  = calcWpm();
  const acc  = calcAccuracy();

  finalWpm.textContent      = wpm;
  finalAccuracy.textContent = acc + '%';
  finalTime.textContent     = secs + 's';
  finalErrors.textContent   = errors;

  // hide the typing UI, show done screen
  paragraphBox.style.display = 'none';
  input.style.display        = 'none';
  document.getElementById('stats').style.display = 'none';
  doneScreen.classList.add('visible');
}

function reset() {
  clearInterval(timerInterval);
  started    = false;
  startTime  = null;
  totalTyped = 0;
  errors     = 0;
  charIndex  = 0;

  wpmEl.textContent      = '--';
  accuracyEl.textContent = '--';
  timerEl.textContent    = '--';

  input.value    = '';
  input.disabled = false;

  paragraphBox.style.display = '';
  input.style.display        = '';
  document.getElementById('stats').style.display = '';
  doneScreen.classList.remove('visible');

  buildParagraph(pickParagraph());
  input.focus();
}

input.addEventListener('input', (e) => {
  // start timer on first keystroke
  if (!started) {
    started   = true;
    startTime = Date.now();
    startTimer();
  }

  const typed = input.value;
  totalTyped++;

  // compare typed value char by char against the paragraph
  for (let i = 0; i < charSpans.length; i++) {
    if (i < typed.length) {
      const correct = typed[i] === charSpans[i].textContent;
      charSpans[i].classList.toggle('correct', correct);
      charSpans[i].classList.toggle('wrong', !correct);
    } else {
      charSpans[i].classList.remove('correct', 'wrong');
    }
  }

  charIndex = typed.length;

  // count errors as mismatched characters up to current position
  errors = 0;
  for (let i = 0; i < typed.length && i < charSpans.length; i++) {
    if (typed[i] !== charSpans[i].textContent) errors++;
  }

  setCursor(charIndex);

  // check if the user has finished the paragraph
  if (typed.length >= charSpans.length) {
    finish();
  }
});

restartBtn.addEventListener('click', reset);

// init
reset();
