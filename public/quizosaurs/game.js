// Enhanced dinosaur quiz game with more interactive features
const dinosaurs = [
    { name: 'T-Rex', emoji: '🦖', clue: 'Massive predator with tiny arms and bone-crushing bite.', fact: 'Could eat up to 500 pounds of meat in one bite!' },
    { name: 'Velociraptor', emoji: '🦅', clue: 'Fast, feathered hunter that hunted in packs.', fact: 'Actually only the size of a turkey, but very intelligent!' },
    { name: 'Triceratops', emoji: '🦏', clue: 'Three horns on face and large bony frill for protection.', fact: 'One of the last non-avian dinosaurs to exist before extinction.' },
    { name: 'Stegosaurus', emoji: '🦎', clue: 'Plates along back and spiked tail called "thagomizer".', fact: 'Had a brain the size of a walnut!' },
    { name: 'Pterodactyl', emoji: '🦇', clue: 'Flying reptile with leathery wings and long beak.', fact: 'Technically called Pterodactylus, and not actually a dinosaur!' },
    { name: 'Brachiosaurus', emoji: '🐘', clue: 'Incredibly long neck to reach high treetops.', fact: 'Could weigh up to 60 tons - as heavy as 10 elephants!' },
    { name: 'Ankylosaurus', emoji: '🛡️', clue: 'Armored tank with club tail for defense.', fact: 'Had bony armor plates embedded in its skin called osteoderms.' },
    { name: 'Spinosaurus', emoji: '🐊', clue: 'Sail-backed dinosaur that was an excellent swimmer.', fact: 'Larger than T-Rex, measuring up to 50 feet long!' },
    { name: 'Parasaurolophus', emoji: '🎺', clue: 'Crest on head used to make deep, resonating sounds.', fact: 'Its crest could be up to 6 feet long!' },
    { name: 'Carnotaurus', emoji: '🐂', clue: 'Bull-like horns above eyes and very short arms.', fact: 'Had the smallest arms of any large predator!' },
    { name: 'Diplodocus', emoji: '🐍', clue: 'Extremely long tail like a whip and peg-like teeth.', fact: 'Could grow up to 90 feet long - longer than a basketball court!' },
    { name: 'Pachycephalosaurus', emoji: '🥚', clue: 'Thick, dome-shaped skull used for head-butting.', fact: 'Its skull could be 10 inches thick!' },
    { name: 'Compsognathus', emoji: '🐔', clue: 'One of the smallest dinosaurs, about the size of a chicken.', fact: 'Was once thought to be the smallest dinosaur ever found.' },
    { name: 'Allosaurus', emoji: '🐺', clue: 'Jurassic predator with sharp claws and large jaws.', fact: 'Had over 70 sharp teeth in its mouth at once!' },
    { name: 'Iguanodon', emoji: '🦷', clue: 'Thumb spikes for defense and beak-like mouth.', fact: 'One of the first dinosaurs ever discovered and named.' }
];

// DOM Elements
const questionText = document.getElementById('questionText');
const dinoEmoji = document.getElementById('dinoEmoji');
const answersEl = document.getElementById('answers');
const scoreEl = document.getElementById('score');
const currentEl = document.getElementById('current');
const totalEl = document.getElementById('total');
const correctEl = document.getElementById('correct');
const streakEl = document.getElementById('streak');
const resultText = document.getElementById('resultText');
const skipBtn = document.getElementById('skipBtn');
const restartBtn = document.getElementById('restartBtn');
const progressFill = document.getElementById('progressFill');

const TOTAL_QUESTIONS = 10;
let quizQuestions = [];
let currentIndex = 0;
let score = 0;
let correct = 0;
let currentStreak = 0;
let answered = false;
let questionStartTime = null;
let totalTimeSpent = 0;

// Helper: Shuffle array
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generate quiz with random questions from dinosaur pool
function makeQuiz() {
    const pool = shuffle(dinosaurs);
    const selected = pool.slice(0, TOTAL_QUESTIONS);
    quizQuestions = selected.map((dino) => {
        // Get wrong answers from other dinosaurs
        const wrongs = shuffle(dinosaurs.filter((d) => d.name !== dino.name))
            .slice(0, 3)
            .map(d => ({ name: d.name, emoji: d.emoji, fact: d.fact }));

        return {
            target: dino,
            choices: shuffle([{ name: dino.name, emoji: dino.emoji, fact: dino.fact }, ...wrongs]),
        };
    });
}

// Update statistics display
function setStats() {
    scoreEl.textContent = score;
    currentEl.textContent = currentIndex + 1;
    totalEl.textContent = TOTAL_QUESTIONS;
    correctEl.textContent = correct;
    streakEl.textContent = currentStreak;

    // Update progress bar
    const progressPercent = ((currentIndex) / TOTAL_QUESTIONS) * 100;
    progressFill.style.width = `${progressPercent}%`;
}

// Show feedback message
function showFeedbackMessage(message, isSuccess = true) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.textContent = message;
    feedback.style.background = isSuccess ? '#4caf50' : '#ff9800';
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Render current question
function renderQuestion() {
    if (currentIndex >= quizQuestions.length) {
        showGameComplete();
        return;
    }

    answered = false;
    questionStartTime = Date.now();

    const q = quizQuestions[currentIndex];

    // Update display
    dinoEmoji.textContent = q.target.emoji;
    dinoEmoji.style.animation = 'none';
    setTimeout(() => dinoEmoji.style.animation = 'pulse 0.5s ease', 10);

    questionText.textContent = q.target.clue;
    answersEl.innerHTML = '';
    resultText.innerHTML = '<span>🤔</span> Choose the correct dinosaur!';
    resultText.style.color = '';

    // Create answer buttons with animations
    q.choices.forEach((choice, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerHTML = `${choice.emoji || '🦕'} ${choice.name}`;
        btn.style.animationDelay = `${idx * 0.05}s`;
        btn.style.animation = 'slideUp 0.3s ease backwards';
        btn.addEventListener('click', () => handleAnswer(choice));
        answersEl.appendChild(btn);
    });

    setStats();
}

// Show game completion with final stats
function showGameComplete() {
    const averageTime = totalTimeSpent / TOTAL_QUESTIONS;
    const finalMessage = `
        🎉 Game Complete! 🎉<br>
        Final Score: ${score} points<br>
        Correct Answers: ${correct}/${TOTAL_QUESTIONS}<br>
        Best Streak: ${Math.max(...getStreakHistory()) || currentStreak}<br>
        Average Response Time: ${(averageTime / 1000).toFixed(1)} seconds<br>
        ${score >= 80 ? '🏆 Dinosaur Master! 🏆' : score >= 60 ? '🌟 Good Job! 🌟' : '🦕 Keep Learning! 🦕'}
    `;

    questionText.textContent = 'Quiz Completed! 🎊';
    dinoEmoji.textContent = '🏆';
    answersEl.innerHTML = '';
    resultText.innerHTML = finalMessage;
    resultText.style.color = '#2e7d32';
    resultText.style.fontSize = '1rem';
    resultText.style.lineHeight = '1.6';

    // Show celebration animation
    showFeedbackMessage('Congratulations! Quiz complete! 🎉', true);
}

// Track streak history (for final stats)
let streakHistory = [];
function updateStreakHistory() {
    streakHistory.push(currentStreak);
}

function getStreakHistory() {
    return streakHistory;
}

// Handle answer selection
function handleAnswer(choice) {
    if (answered || currentIndex >= quizQuestions.length) return;

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    totalTimeSpent += timeSpent * 1000;

    answered = true;
    const q = quizQuestions[currentIndex];
    const buttons = answersEl.querySelectorAll('.answer-btn');
    const isCorrect = choice.name === q.target.name;

    // Disable all buttons
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    if (isCorrect) {
        // Points based on time bonus
        const timeBonus = Math.max(0, Math.floor(5 - timeSpent));
        const pointsEarned = 10 + timeBonus;
        score += pointsEarned;
        correct += 1;
        currentStreak += 1;

        resultText.innerHTML = `✅ CORRECT! ✅ ${q.target.fact}<br>🎯 +${pointsEarned} points (${timeBonus} time bonus!)`;
        resultText.style.color = '#1a7c13';

        // Highlight correct answer
        buttons.forEach(btn => {
            if (btn.textContent.includes(q.target.name)) {
                btn.classList.add('correct');
            }
        });

        showFeedbackMessage(`Correct! +${pointsEarned} points! 🔥`, true);

        // Play success animation
        dinoEmoji.style.animation = 'none';
        setTimeout(() => dinoEmoji.style.animation = 'bounce 0.5s ease', 10);

    } else {
        score = Math.max(0, score - 3);
        currentStreak = 0;

        const correctDino = q.target;
        resultText.innerHTML = `❌ WRONG! ❌ It was ${correctDino.name} ${correctDino.emoji}<br>📚 ${correctDino.fact}`;
        resultText.style.color = '#a91313';

        // Highlight correct and wrong answers
        buttons.forEach(btn => {
            if (btn.textContent.includes(correctDino.name)) {
                btn.classList.add('correct');
            }
            if (btn.textContent.includes(choice.name) && !btn.textContent.includes(correctDino.name)) {
                btn.classList.add('wrong');
            }
        });

        showFeedbackMessage(`Wrong! It was ${correctDino.name} 😢`, false);
    }

    updateStreakHistory();
    setStats();

    // Auto advance to next question
    setTimeout(() => nextQuestion(), 2000);
}

// Move to next question
function nextQuestion() {
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
        renderQuestion();
    } else {
        renderQuestion(); // This will trigger game complete
    }
}

// Skip current question
function skipQuestion() {
    if (answered || currentIndex >= quizQuestions.length) return;

    answered = true;
    score = Math.max(0, score - 1);
    currentStreak = 0;

    const q = quizQuestions[currentIndex];
    resultText.innerHTML = `⏭️ Skipped! The answer was ${q.target.name} ${q.target.emoji}<br>📚 ${q.target.fact}`;
    resultText.style.color = '#ff9800';

    // Highlight correct answer on skip
    const buttons = answersEl.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(q.target.name)) {
            btn.classList.add('correct');
        }
        btn.style.pointerEvents = 'none';
    });

    showFeedbackMessage('Question skipped! -1 point', false);
    setStats();

    setTimeout(() => nextQuestion(), 1500);
}

// Restart the game
function restartGame() {
    score = 0;
    correct = 0;
    currentStreak = 0;
    currentIndex = 0;
    totalTimeSpent = 0;
    streakHistory = [];
    answered = false;

    makeQuiz();
    renderQuestion();

    showFeedbackMessage('Game restarted! Good luck! 🦖', true);
}

// Event listeners
skipBtn.addEventListener('click', skipQuestion);
restartBtn.addEventListener('click', restartGame);

// Initialize game
makeQuiz();
renderQuestion();

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        if (!answered && currentIndex < quizQuestions.length) {
            // Quick skip with right arrow
            skipQuestion();
        }
    } else if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

// Add hover sound effect concept (visual only)
const style = document.createElement('style');
style.textContent = `
    .answer-btn {
        transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);