// Cycle through available PNGs instead of emojis
const DINO_IMGS = ['/dino.png', '/dino2.png', '/dino3.png', '/caveman.png', '/spear.png'];
function dinoImg(index) {
    return DINO_IMGS[index % DINO_IMGS.length];
}

const dinosaurs = [
    { name: 'T-Rex',             img: dinoImg(0), clue: 'Massive predator with tiny arms and bone-crushing bite.',      fact: 'Could eat up to 500 pounds of meat in one bite!' },
    { name: 'Velociraptor',      img: dinoImg(1), clue: 'Fast, feathered hunter that hunted in packs.',                 fact: 'Actually only the size of a turkey, but very intelligent!' },
    { name: 'Triceratops',       img: dinoImg(2), clue: 'Three horns on face and large bony frill for protection.',     fact: 'One of the last non-avian dinosaurs to exist before extinction.' },
    { name: 'Stegosaurus',       img: dinoImg(3), clue: 'Plates along back and spiked tail called "thagomizer".',       fact: 'Had a brain the size of a walnut!' },
    { name: 'Pterodactyl',       img: dinoImg(4), clue: 'Flying reptile with leathery wings and long beak.',            fact: 'Technically called Pterodactylus, and not actually a dinosaur!' },
    { name: 'Brachiosaurus',     img: dinoImg(0), clue: 'Incredibly long neck to reach high treetops.',                 fact: 'Could weigh up to 60 tons — as heavy as 10 elephants!' },
    { name: 'Ankylosaurus',      img: dinoImg(1), clue: 'Armored tank with club tail for defense.',                     fact: 'Had bony armor plates embedded in its skin called osteoderms.' },
    { name: 'Spinosaurus',       img: dinoImg(2), clue: 'Sail-backed dinosaur that was an excellent swimmer.',          fact: 'Larger than T-Rex, measuring up to 50 feet long!' },
    { name: 'Parasaurolophus',   img: dinoImg(3), clue: 'Crest on head used to make deep, resonating sounds.',         fact: 'Its crest could be up to 6 feet long!' },
    { name: 'Carnotaurus',       img: dinoImg(4), clue: 'Bull-like horns above eyes and very short arms.',              fact: 'Had the smallest arms of any large predator!' },
    { name: 'Diplodocus',        img: dinoImg(0), clue: 'Extremely long tail like a whip and peg-like teeth.',          fact: 'Could grow up to 90 feet long — longer than a basketball court!' },
    { name: 'Pachycephalosaurus',img: dinoImg(1), clue: 'Thick, dome-shaped skull used for head-butting.',              fact: 'Its skull could be 10 inches thick!' },
    { name: 'Compsognathus',     img: dinoImg(2), clue: 'One of the smallest dinosaurs, about the size of a chicken.',  fact: 'Was once thought to be the smallest dinosaur ever found.' },
    { name: 'Allosaurus',        img: dinoImg(3), clue: 'Jurassic predator with sharp claws and large jaws.',           fact: 'Had over 70 sharp teeth in its mouth at once!' },
    { name: 'Iguanodon',         img: dinoImg(4), clue: 'Thumb spikes for defense and beak-like mouth.',                fact: 'One of the first dinosaurs ever discovered and named.' }
];

const questionText = document.getElementById('questionText');
const dinoEmojiEl  = document.getElementById('dinoEmoji');
const answersEl    = document.getElementById('answers');
const scoreEl      = document.getElementById('score');
const currentEl    = document.getElementById('current');
const totalEl      = document.getElementById('total');
const correctEl    = document.getElementById('correct');
const streakEl     = document.getElementById('streak');
const resultText   = document.getElementById('resultText');
const skipBtn      = document.getElementById('skipBtn');
const restartBtn   = document.getElementById('restartBtn');
const progressFill = document.getElementById('progressFill');

const TOTAL_QUESTIONS = 10;
let quizQuestions  = [];
let currentIndex   = 0;
let score          = 0;
let correct        = 0;
let currentStreak  = 0;
let answered       = false;
let questionStartTime = null;
let totalTimeSpent = 0;
let streakHistory  = [];

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function makeQuiz() {
    const pool = shuffle(dinosaurs).slice(0, TOTAL_QUESTIONS);
    quizQuestions = pool.map(dino => {
        const wrongs = shuffle(dinosaurs.filter(d => d.name !== dino.name))
            .slice(0, 3)
            .map(d => ({ name: d.name, img: d.img, fact: d.fact }));
        return {
            target: dino,
            choices: shuffle([{ name: dino.name, img: dino.img, fact: dino.fact }, ...wrongs])
        };
    });
}

function setStats() {
    scoreEl.textContent   = score;
    currentEl.textContent = currentIndex + 1;
    totalEl.textContent   = TOTAL_QUESTIONS;
    correctEl.textContent = correct;
    streakEl.textContent  = currentStreak;
    progressFill.style.width = `${(currentIndex / TOTAL_QUESTIONS) * 100}%`;
}

function showFeedback(msg, success = true) {
    const el = document.createElement('div');
    el.className = 'feedback-message';
    el.textContent = msg;
    el.style.background = success ? '#2a7a36' : '#7a2a2a';
    el.style.cssText += ';position:fixed;bottom:20px;right:20px;color:#fff;padding:10px 18px;border-radius:10px;font-weight:700;z-index:999;';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

function renderQuestion() {
    if (currentIndex >= quizQuestions.length) { showGameComplete(); return; }

    answered = false;
    questionStartTime = Date.now();
    const q = quizQuestions[currentIndex];

    // show dino image instead of emoji
    dinoEmojiEl.innerHTML = `<img src="${q.target.img}" alt="${q.target.name}" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 14px;">`;

    questionText.textContent = q.target.clue;
    answersEl.innerHTML = '';
    resultText.textContent = 'Choose the correct dinosaur!';
    resultText.style.color = '';

    q.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        // image + name, no emoji
        btn.innerHTML = `<span style="color:var(--green);font-size:1.2rem;flex-shrink:0;">•</span> ${choice.name}`;
        btn.style.animation = `slideUp 0.3s ease ${idx * 0.05}s backwards`;
        btn.addEventListener('click', () => handleAnswer(choice));
        answersEl.appendChild(btn);
    });

    setStats();
}

function showGameComplete() {
    const avg = (totalTimeSpent / TOTAL_QUESTIONS / 1000).toFixed(1);
    const grade = score >= 80 ? 'Dino Master!' : score >= 60 ? 'Good job!' : 'Keep learning!';
    questionText.textContent = 'Quiz Complete!';
    dinoEmojiEl.innerHTML = `<img src="/dino.png" alt="" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 14px;">`;
    answersEl.innerHTML = '';
    resultText.innerHTML = `Final Score: ${score} pts &nbsp;|&nbsp; Correct: ${correct}/${TOTAL_QUESTIONS} &nbsp;|&nbsp; Avg time: ${avg}s<br><strong>${grade}</strong>`;
    resultText.style.color = 'var(--green)';
    progressFill.style.width = '100%';
}

function handleAnswer(choice) {
    if (answered || currentIndex >= quizQuestions.length) return;
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    totalTimeSpent += timeSpent * 1000;
    answered = true;

    const q = quizQuestions[currentIndex];
    const buttons = answersEl.querySelectorAll('.answer-btn');
    const isCorrect = choice.name === q.target.name;
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    if (isCorrect) {
        const timeBonus = Math.max(0, Math.floor(5 - timeSpent));
        const pts = 10 + timeBonus;
        score += pts; correct++; currentStreak++;
        resultText.textContent = `Correct! ${q.target.fact} +${pts} pts`;
        resultText.style.color = 'var(--green)';
        buttons.forEach(btn => { if (btn.textContent.includes(q.target.name)) btn.classList.add('correct'); });
        showFeedback(`Correct! +${pts} pts`, true);
    } else {
        score = Math.max(0, score - 3);
        currentStreak = 0;
        resultText.textContent = `Wrong! It was ${q.target.name}. ${q.target.fact}`;
        resultText.style.color = 'var(--red)';
        buttons.forEach(btn => {
            if (btn.textContent.includes(q.target.name)) btn.classList.add('correct');
            else if (btn.textContent.includes(choice.name)) btn.classList.add('wrong');
        });
        showFeedback(`Wrong! It was ${q.target.name}`, false);
    }

    streakHistory.push(currentStreak);
    setStats();
    setTimeout(() => { currentIndex++; renderQuestion(); }, 2000);
}

function skipQuestion() {
    if (answered || currentIndex >= quizQuestions.length) return;
    answered = true;
    score = Math.max(0, score - 1);
    currentStreak = 0;
    const q = quizQuestions[currentIndex];
    resultText.textContent = `Skipped! The answer was ${q.target.name}.`;
    resultText.style.color = 'var(--orange)';
    answersEl.querySelectorAll('.answer-btn').forEach(btn => {
        if (btn.textContent.includes(q.target.name)) btn.classList.add('correct');
        btn.style.pointerEvents = 'none';
    });
    setStats();
    setTimeout(() => { currentIndex++; renderQuestion(); }, 1500);
}

function restartGame() {
    score = correct = currentStreak = currentIndex = totalTimeSpent = 0;
    streakHistory = []; answered = false;
    makeQuiz();
    renderQuestion();
}

skipBtn.addEventListener('click', skipQuestion);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') skipQuestion();
    if (e.key === 'r' || e.key === 'R') restartGame();
});

const style = document.createElement('style');
style.textContent = `@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(style);

makeQuiz();
renderQuestion();
